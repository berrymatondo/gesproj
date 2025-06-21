"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Users,
  Building2,
  Activity,
  ChevronRight,
  Plus,
  BarChart3,
  FolderOpen,
  Star,
  Calendar,
  User,
  Mail,
  Phone,
} from "lucide-react";
import { MobileHeader } from "./mobile-header";
import { useMediaQuery } from "@/hooks/use-media-query";
import Link from "next/link";
import type { Person } from "@/types/project";

interface DashboardStats {
  totalPersons: number;
  activePersons: number;
  inactivePersons: number;
  deletedPersons: number;
  totalDepartments: number;
  activeDepartments: number;
  inactiveDepartments: number;
  deletedDepartments: number;
  totalProjects: number;
  newProjects: number;
  inProgressProjects: number;
  deliveredProjects: number;
  deletedProjects: number;
  highPriorityProjects: number;
  projectsEndingSoon: number;
}

interface ProjectSummary {
  id: string;
  name: string;
  priority: number;
  status: string;
  endDate: string;
  owners: Person[];
}

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPersons: 0,
    activePersons: 0,
    inactivePersons: 0,
    deletedPersons: 0,
    totalDepartments: 0,
    activeDepartments: 0,
    inactiveDepartments: 0,
    deletedDepartments: 0,
    totalProjects: 0,
    newProjects: 0,
    inProgressProjects: 0,
    deliveredProjects: 0,
    deletedProjects: 0,
    highPriorityProjects: 0,
    projectsEndingSoon: 0,
  });
  const [recentProjects, setRecentProjects] = useState<ProjectSummary[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [personDialogOpen, setPersonDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const isMobile = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);

        // Fetch departments stats
        const deptResponse = await fetch("/api/departments");
        const departments = await deptResponse.json();

        // Fetch persons stats
        const personsResponse = await fetch("/api/persons");
        const persons = await personsResponse.json();

        // Fetch projects stats
        const projectsResponse = await fetch("/api/projects");
        const projects = await projectsResponse.json();

        const deptStats = {
          totalDepartments: departments.length,
          activeDepartments: departments.filter(
            (d: any) => d.status === "active"
          ).length,
          inactiveDepartments: departments.filter(
            (d: any) => d.status === "inactive"
          ).length,
          deletedDepartments: departments.filter(
            (d: any) => d.status === "deleted"
          ).length,
        };

        const personStats = {
          totalPersons: persons.length,
          activePersons: persons.filter((p: any) => p.status === "active")
            .length,
          inactivePersons: persons.filter((p: any) => p.status === "inactive")
            .length,
          deletedPersons: persons.filter((p: any) => p.status === "deleted")
            .length,
        };

        const activeProjects = projects.filter((p: any) => !p.deleted);
        const now = new Date();
        const oneWeekFromNow = new Date(
          now.getTime() + 7 * 24 * 60 * 60 * 1000
        );

        const projectStats = {
          totalProjects: activeProjects.length,
          newProjects: activeProjects.filter((p: any) => p.status === "new")
            .length,
          inProgressProjects: activeProjects.filter(
            (p: any) => p.status === "in_progress"
          ).length,
          deliveredProjects: activeProjects.filter(
            (p: any) => p.status === "delivered"
          ).length,
          deletedProjects: projects.filter((p: any) => p.deleted).length,
          highPriorityProjects: activeProjects.filter(
            (p: any) => p.priority >= 4
          ).length,
          projectsEndingSoon: activeProjects.filter((p: any) => {
            const endDate = new Date(p.endDate);
            return endDate <= oneWeekFromNow && endDate >= now;
          }).length,
        };

        setStats({ ...deptStats, ...personStats, ...projectStats });

        // Set recent projects (top 5 by priority and creation date)
        const recent = projects
          .filter((p: any) => !p.deleted)
          .sort(
            (a: any, b: any) =>
              b.priority - a.priority ||
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          .slice(0, 5)
          .map((p: any) => ({
            id: p.id,
            name: p.name,
            priority: p.priority,
            status: p.status,
            endDate: p.endDate,
            owners: p.owners || [],
          }));

        setRecentProjects(recent);
      } catch (error) {
        console.error("Erreur lors du chargement des statistiques:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleExportExcel = () => {
    console.log("Export Excel depuis le dashboard");
  };

  const openPersonDialog = (person: Person) => {
    setSelectedPerson(person);
    setPersonDialogOpen(true);
  };

  const projectCompletionRate =
    stats.totalProjects > 0
      ? Math.round((stats.deliveredProjects / stats.totalProjects) * 100)
      : 0;
  const personCompletionRate =
    stats.totalPersons > 0
      ? Math.round((stats.activePersons / stats.totalPersons) * 100)
      : 0;

  const renderStars = (priority: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${
          i < priority ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 text-xs">
            Nouveau
          </Badge>
        );
      case "in_progress":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 text-xs">
            En cours
          </Badge>
        );
      case "delivered":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-xs">
            Livré
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="text-xs">
            Inconnu
          </Badge>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileHeader onExportExcel={handleExportExcel} />

      <div className="p-4 md:p-6">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
          <span>Accueil</span>
          <ChevronRight className="h-4 w-4" />
          <span>Tableau de bord</span>
          <ChevronRight className="h-4 w-4" />
          <span className="text-gray-900">Vue d'ensemble 2024 - 2025</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Tableau de bord général 2024 - 2025
                </h1>
              </div>
              <Button className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une action
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Projets Actifs
                      </p>
                      <p className="text-2xl font-bold text-blue-600">
                        {stats.totalProjects}
                      </p>
                    </div>
                    <FolderOpen className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="mt-2">
                    <Progress value={projectCompletionRate} className="h-2" />
                    <p className="text-xs text-gray-500 mt-1">
                      {projectCompletionRate}% livrés
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Haute Priorité
                      </p>
                      <p className="text-2xl font-bold text-red-600">
                        {stats.highPriorityProjects}
                      </p>
                    </div>
                    <Star className="h-8 w-8 text-yellow-400 fill-current" />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">4-5 étoiles</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Échéances Proches
                      </p>
                      <p className="text-2xl font-bold text-orange-600">
                        {stats.projectsEndingSoon}
                      </p>
                    </div>
                    <Calendar className="h-8 w-8 text-orange-600" />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Dans 7 jours</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        En Cours
                      </p>
                      <p className="text-2xl font-bold text-green-600">
                        {stats.inProgressProjects}
                      </p>
                    </div>
                    <Activity className="h-8 w-8 text-green-600" />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Projets actifs</p>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
                <TabsTrigger value="projects">Projets</TabsTrigger>
                <TabsTrigger value="departments">Départements</TabsTrigger>
                <TabsTrigger value="persons">Personnes</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Recent Projects */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Projets Récents</span>
                      <Link href="/projects">
                        <Button variant="outline" size="sm">
                          Voir tous
                        </Button>
                      </Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentProjects.map((project) => (
                        <div
                          key={project.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-medium">{project.name}</h4>
                              <div className="flex items-center">
                                {renderStars(project.priority)}
                              </div>
                              {getStatusBadge(project.status)}
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-4 w-4" />
                                <span>
                                  Fin:{" "}
                                  {new Date(project.endDate).toLocaleDateString(
                                    "fr-FR"
                                  )}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <User className="h-4 w-4" />
                                <span>
                                  {project.owners.map((owner, index) => (
                                    <button
                                      key={owner.id}
                                      onClick={() => openPersonDialog(owner)}
                                      className="text-blue-600 hover:underline"
                                    >
                                      {owner.firstName} {owner.lastName}
                                      {index < project.owners.length - 1 &&
                                        ", "}
                                    </button>
                                  ))}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Management Cards */}
                <div>
                  <h2 className="text-xl font-semibold mb-4">
                    Consultez et gérez vos données
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link href="/projects">
                      <Card className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                <FolderOpen className="h-6 w-6 text-purple-600" />
                              </div>
                              <div>
                                <h3 className="font-semibold">Projets</h3>
                                <p className="text-sm text-gray-500">
                                  {stats.totalProjects} projets actifs
                                  {stats.highPriorityProjects > 0 && (
                                    <span className="ml-2">
                                      <Badge
                                        variant="secondary"
                                        className="text-xs"
                                      >
                                        {stats.highPriorityProjects} haute
                                        priorité
                                      </Badge>
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-gray-400" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>

                    <Link href="/departments">
                      <Card className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <Building2 className="h-6 w-6 text-blue-600" />
                              </div>
                              <div>
                                <h3 className="font-semibold">Départements</h3>
                                <p className="text-sm text-gray-500">
                                  {stats.activeDepartments}/
                                  {stats.totalDepartments} départements
                                </p>
                              </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-gray-400" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>

                    <Link href="/persons">
                      <Card className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <Users className="h-6 w-6 text-green-600" />
                              </div>
                              <div>
                                <h3 className="font-semibold">Personnes</h3>
                                <p className="text-sm text-gray-500">
                                  {stats.activePersons}/{stats.totalPersons}{" "}
                                  personnes
                                </p>
                              </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-gray-400" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>

                    <Card className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                              <BarChart3 className="h-6 w-6 text-orange-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold">Rapports</h3>
                              <p className="text-sm text-gray-500">
                                Analytics et métriques
                              </p>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="projects" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Projets
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {stats.totalProjects}
                      </div>
                      <Progress
                        value={projectCompletionRate}
                        className="mt-2"
                      />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Nouveaux
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-600">
                        {stats.newProjects}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        En cours
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-yellow-600">
                        {stats.inProgressProjects}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Livrés
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">
                        {stats.deliveredProjects}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="departments" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Départements
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {stats.totalDepartments}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Actifs
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">
                        {stats.activeDepartments}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Inactifs
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-yellow-600">
                        {stats.inactiveDepartments}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="persons" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Personnes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {stats.totalPersons}
                      </div>
                      <Progress value={personCompletionRate} className="mt-2" />
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Actives
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">
                        {stats.activePersons}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">
                        Inactives
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-yellow-600">
                        {stats.inactivePersons}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Étapes de gestion</CardTitle>
                  <Badge variant="secondary">Notes (3)</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-blue-500 rounded-full flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        Début de l'organisation
                      </p>
                      <p className="text-xs text-gray-500">01/04/2024</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 border-2 border-blue-500 rounded-full flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Gestion en cours</p>
                      <p className="text-xs text-gray-500">01/04/2024</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 border-2 border-gray-300 rounded-full flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        Document de synthèse encodé
                      </p>
                      <p className="text-xs text-gray-500">---</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 border-2 border-gray-300 rounded-full flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        Réception du plan d'action
                      </p>
                      <p className="text-xs text-gray-500">
                        Date limite d'envoi
                      </p>
                      <p className="text-xs text-gray-500">01/01/2026</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 border-2 border-gray-300 rounded-full flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        Traitement par l'ONE
                      </p>
                      <p className="text-xs text-gray-500">---</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 border-2 border-gray-300 rounded-full flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Clôture du bilan</p>
                      <p className="text-xs text-gray-500">---</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Person Details Dialog */}
      <Dialog open={personDialogOpen} onOpenChange={setPersonDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Détails de la personne</DialogTitle>
          </DialogHeader>
          {selectedPerson && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">
                    {selectedPerson.firstName} {selectedPerson.lastName}
                  </h3>
                  <Badge
                    className={
                      selectedPerson.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }
                  >
                    {selectedPerson.status === "active" ? "Actif" : "Inactif"}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-gray-600">
                      {selectedPerson.email}
                    </p>
                  </div>
                </div>

                {selectedPerson.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">Téléphone</p>
                      <p className="text-sm text-gray-600">
                        {selectedPerson.phone}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">ID</p>
                    <p className="text-sm text-gray-600 font-mono">
                      {selectedPerson.id}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setPersonDialogOpen(false)}
                >
                  Fermer
                </Button>
                <Link href={`/persons`}>
                  <Button onClick={() => setPersonDialogOpen(false)}>
                    Voir dans la liste
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
