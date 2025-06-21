"use client";

import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Star,
  ExternalLink,
  MessageSquare,
  Calendar,
  User,
  Mail,
  Phone,
  Code,
  BarChart3,
} from "lucide-react";
import { ProjectForm } from "./project-form";
import { MobileHeader } from "./mobile-header";
import type { Project, ProjectStatus } from "@/types/project";
import { useProjects } from "@/hooks/use-projects";
import { useMediaQuery } from "@/hooks/use-media-query";
import * as XLSX from "xlsx";
import Link from "next/link";
import type { Person } from "@/types/person";
import { ProjectDetailsDialog } from "./project-details-dialog";

export function ProjectsPage() {
  const {
    projects,
    loading,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    showDeleted,
    setShowDeleted,
    addProject,
    updateProject,
    deleteProject,
    restoreProject,
    addComment,
  } = useProjects();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [newComment, setNewComment] = useState("");
  const [commentAuthor, setCommentAuthor] = useState("");
  const isMobile = useMediaQuery("(max-width: 768px)");

  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [personDialogOpen, setPersonDialogOpen] = useState(false);

  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedProjectForDetails, setSelectedProjectForDetails] =
    useState<Project | null>(null);

  const openPersonDialog = (person: Person) => {
    setSelectedPerson(person);
    setPersonDialogOpen(true);
  };

  const handleAddProject = async (data: any) => {
    await addProject(data);
    setIsFormOpen(false);
  };

  const handleEditProject = async (data: any) => {
    if (editingProject) {
      await updateProject(editingProject.id, data);
      setEditingProject(null);
      setIsFormOpen(false);
    }
  };

  const handleDeleteProject = async (id: string) => {
    await deleteProject(id);
  };

  const handleRestoreProject = async (id: string) => {
    await restoreProject(id);
  };

  const openEditForm = (project: Project) => {
    setEditingProject(project);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingProject(null);
  };

  const openCommentDialog = (project: Project) => {
    setSelectedProject(project);
    setCommentDialogOpen(true);
    setNewComment("");
    setCommentAuthor("");
  };

  const handleAddComment = async () => {
    if (selectedProject && newComment.trim() && commentAuthor.trim()) {
      await addComment(
        selectedProject.id,
        newComment.trim(),
        commentAuthor.trim()
      );
      setCommentDialogOpen(false);
      setNewComment("");
      setCommentAuthor("");
    }
  };

  const handleExportExcel = () => {
    const exportData = projects.map((project, index) => ({
      "N°": index + 1,
      ID: project.id,
      Dénomination: project.name,
      Description: project.description || "",
      "Porteurs de projet": project.owners
        .map((o) => `${o.firstName} ${o.lastName}`)
        .join(", "),
      Analystes: project.analysts
        .map((a) => `${a.firstName} ${a.lastName}`)
        .join(", "), // Nouvelle colonne
      Développeurs: project.developers
        .map((d) => `${d.firstName} ${d.lastName}`)
        .join(", "), // Nouvelle colonne
      "Date de début": new Date(project.startDate).toLocaleDateString("fr-FR"),
      "Date de fin": new Date(project.endDate).toLocaleDateString("fr-FR"),
      Priorité: "★".repeat(project.priority) + "☆".repeat(5 - project.priority),
      "Lien de test": project.testLink || "",
      Statut:
        project.status === "new"
          ? "Nouveau"
          : project.status === "in_progress"
          ? "En cours"
          : "Livré",
      "Dernier commentaire": project.lastComment?.content || "",
      "Date de création": new Date(project.createdAt).toLocaleDateString(
        "fr-FR"
      ),
      "Dernière modification": new Date(project.updatedAt).toLocaleDateString(
        "fr-FR"
      ),
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);
    ws["!cols"] = [
      { wch: 5 },
      { wch: 18 },
      { wch: 25 },
      { wch: 30 },
      { wch: 25 }, // Augmenté pour les porteurs multiples
      { wch: 15 },
      { wch: 15 },
      { wch: 10 },
      { wch: 25 },
      { wch: 12 },
      { wch: 30 },
      { wch: 18 },
      { wch: 22 },
    ];
    XLSX.utils.book_append_sheet(wb, ws, "Projets");

    const wbArray = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbArray], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const dateStr = new Date().toISOString().split("T")[0];
    const filename = `projets_${dateStr}.xlsx`;
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case "new":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            Nouveau
          </Badge>
        );
      case "in_progress":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            En cours
          </Badge>
        );
      case "delivered":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Livré
          </Badge>
        );
      default:
        return <Badge variant="secondary">Inconnu</Badge>;
    }
  };

  const renderStars = (priority: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < priority ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

  const openDetailsDialog = (project: Project) => {
    setSelectedProjectForDetails(project);
    setDetailsDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileHeader onExportExcel={handleExportExcel} />

      <div className="p-4 md:p-6">
        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
          <h1 className="text-2xl font-bold text-gray-900">
            Liste des projets
          </h1>
        </div>

        <Card>
          <CardHeader className="pb-4">
            {/* Search and Filters */}
            <div className="flex flex-col space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Rechercher un projet..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-12 md:h-10"
                  />
                </div>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-48 h-12 md:h-10">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="new">Nouveau</SelectItem>
                    <SelectItem value="in_progress">En cours</SelectItem>
                    <SelectItem value="delivered">Livré</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="showDeleted"
                    checked={showDeleted}
                    onCheckedChange={(checked) =>
                      setShowDeleted(checked === true)
                    }
                  />
                  <label htmlFor="showDeleted" className="text-sm font-medium">
                    Afficher supprimés
                  </label>
                </div>
              </div>

              {/* Add Button */}
              <div className="flex justify-end">
                <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                  <DialogTrigger asChild>
                    <Button
                      onClick={() => setEditingProject(null)}
                      className="w-full sm:w-auto h-12 md:h-10"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter un projet
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden">
                    <DialogHeader>
                      <DialogTitle>
                        {editingProject
                          ? "Modifier le projet"
                          : "Ajouter un projet"}
                      </DialogTitle>
                    </DialogHeader>
                    <ProjectForm
                      project={editingProject}
                      onSubmit={
                        editingProject ? handleEditProject : handleAddProject
                      }
                      onCancel={closeForm}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0 md:p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">Chargement...</p>
              </div>
            ) : projects.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 text-lg">Aucun projet trouvé</p>
              </div>
            ) : (
              <>
                {/* Mobile View - Cards */}
                <div className="md:hidden px-4 pb-4">
                  {projects.map((project) => (
                    <Card key={project.id} className="mb-3">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="font-semibold text-gray-900 truncate">
                                {project.name}
                              </h3>
                              {project.deleted && (
                                <Badge variant="destructive">Supprimé</Badge>
                              )}
                            </div>

                            <div className="flex items-center space-x-2 mb-2">
                              {getStatusBadge(project.status)}
                              <div className="flex items-center">
                                {renderStars(project.priority)}
                              </div>
                            </div>

                            <div className="text-sm text-gray-600 space-y-1">
                              <div className="flex items-center space-x-2">
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
                              {(project.analysts.length > 0 ||
                                project.developers.length > 0) && (
                                <div className="text-sm text-gray-600 space-y-1 mt-2">
                                  {project.analysts.length > 0 && (
                                    <div className="flex items-center space-x-2">
                                      <BarChart3 className="h-4 w-4" />
                                      <span>
                                        Analystes:{" "}
                                        {project.analysts.map(
                                          (analyst, index) => (
                                            <button
                                              key={analyst.id}
                                              onClick={() =>
                                                openPersonDialog(analyst)
                                              }
                                              className="text-blue-600 hover:underline"
                                            >
                                              {analyst.firstName}{" "}
                                              {analyst.lastName}
                                              {index <
                                                project.analysts.length - 1 &&
                                                ", "}
                                            </button>
                                          )
                                        )}
                                      </span>
                                    </div>
                                  )}
                                  {project.developers.length > 0 && (
                                    <div className="flex items-center space-x-2">
                                      <Code className="h-4 w-4" />
                                      <span>
                                        Développeurs:{" "}
                                        {project.developers.map(
                                          (developer, index) => (
                                            <button
                                              key={developer.id}
                                              onClick={() =>
                                                openPersonDialog(developer)
                                              }
                                              className="text-blue-600 hover:underline"
                                            >
                                              {developer.firstName}{" "}
                                              {developer.lastName}
                                              {index <
                                                project.developers.length - 1 &&
                                                ", "}
                                            </button>
                                          )
                                        )}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              )}
                              <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4" />
                                <span>
                                  {new Date(
                                    project.startDate
                                  ).toLocaleDateString("fr-FR")}{" "}
                                  -{" "}
                                  {new Date(project.endDate).toLocaleDateString(
                                    "fr-FR"
                                  )}
                                </span>
                              </div>
                              {project.lastComment && (
                                <div className="flex items-start space-x-2">
                                  <MessageSquare className="h-4 w-4 mt-0.5" />
                                  <span className="text-xs italic">
                                    "{project.lastComment.content}"
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => openDetailsDialog(project)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Voir
                              </DropdownMenuItem>
                              {!project.deleted && (
                                <>
                                  <DropdownMenuItem
                                    onClick={() => openEditForm(project)}
                                  >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Modifier
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => openCommentDialog(project)}
                                  >
                                    <MessageSquare className="h-4 w-4 mr-2" />
                                    Commenter
                                  </DropdownMenuItem>
                                  {project.testLink && (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        window.open(project.testLink, "_blank")
                                      }
                                    >
                                      <ExternalLink className="h-4 w-4 mr-2" />
                                      Tester
                                    </DropdownMenuItem>
                                  )}
                                </>
                              )}
                              {project.deleted ? (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleRestoreProject(project.id)
                                  }
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  Restaurer
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleDeleteProject(project.id)
                                  }
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Supprimer
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Desktop View - Table */}
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Projet</TableHead>
                        <TableHead>Porteurs</TableHead>
                        <TableHead>Analystes</TableHead>{" "}
                        {/* Nouvelle colonne */}
                        <TableHead>Développeurs</TableHead>{" "}
                        {/* Nouvelle colonne */}
                        <TableHead>Dates</TableHead>
                        <TableHead>Priorité</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Dernier commentaire</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {projects.map((project) => (
                        <TableRow
                          key={project.id}
                          className={project.deleted ? "opacity-50" : ""}
                        >
                          <TableCell>
                            <div>
                              <div className="font-medium flex items-center space-x-2">
                                <span>{project.name}</span>
                                {project.deleted && (
                                  <Badge
                                    variant="destructive"
                                    className="text-xs"
                                  >
                                    Supprimé
                                  </Badge>
                                )}
                              </div>
                              {project.description && (
                                <div className="text-sm text-gray-500 truncate max-w-xs">
                                  {project.description}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {project.owners.map((owner) => (
                                <button
                                  key={owner.id}
                                  onClick={() => openPersonDialog(owner)}
                                  className="block text-blue-600 hover:underline text-sm"
                                >
                                  {owner.firstName} {owner.lastName}
                                </button>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {project.analysts.length > 0 ? (
                                project.analysts.map((analyst) => (
                                  <button
                                    key={analyst.id}
                                    onClick={() => openPersonDialog(analyst)}
                                    className="block text-blue-600 hover:underline text-sm"
                                  >
                                    {analyst.firstName} {analyst.lastName}
                                  </button>
                                ))
                              ) : (
                                <span className="text-gray-400 text-sm">
                                  Aucun
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {project.developers.length > 0 ? (
                                project.developers.map((developer) => (
                                  <button
                                    key={developer.id}
                                    onClick={() => openPersonDialog(developer)}
                                    className="block text-blue-600 hover:underline text-sm"
                                  >
                                    {developer.firstName} {developer.lastName}
                                  </button>
                                ))
                              ) : (
                                <span className="text-gray-400 text-sm">
                                  Aucun
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>
                                Début:{" "}
                                {new Date(project.startDate).toLocaleDateString(
                                  "fr-FR"
                                )}
                              </div>
                              <div>
                                Fin:{" "}
                                {new Date(project.endDate).toLocaleDateString(
                                  "fr-FR"
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              {renderStars(project.priority)}
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(project.status)}
                          </TableCell>
                          <TableCell>
                            {project.lastComment ? (
                              <div className="max-w-xs">
                                <div className="text-sm italic truncate">
                                  "{project.lastComment.content}"
                                </div>
                                <div className="text-xs text-gray-500">
                                  par {project.lastComment.author} le{" "}
                                  {new Date(
                                    project.lastComment.createdAt
                                  ).toLocaleDateString("fr-FR")}
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-400">
                                Aucun commentaire
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => openDetailsDialog(project)}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  Voir
                                </DropdownMenuItem>
                                {!project.deleted && (
                                  <>
                                    <DropdownMenuItem
                                      onClick={() => openEditForm(project)}
                                    >
                                      <Edit className="h-4 w-4 mr-2" />
                                      Modifier
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => openCommentDialog(project)}
                                    >
                                      <MessageSquare className="h-4 w-4 mr-2" />
                                      Commenter
                                    </DropdownMenuItem>
                                    {project.testLink && (
                                      <DropdownMenuItem
                                        onClick={() =>
                                          window.open(
                                            project.testLink,
                                            "_blank"
                                          )
                                        }
                                      >
                                        <ExternalLink className="h-4 w-4 mr-2" />
                                        Tester
                                      </DropdownMenuItem>
                                    )}
                                  </>
                                )}
                                {project.deleted ? (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleRestoreProject(project.id)
                                    }
                                  >
                                    <Eye className="h-4 w-4 mr-2" />
                                    Restaurer
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleDeleteProject(project.id)
                                    }
                                    className="text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Supprimer
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Comment Dialog */}
      <Dialog open={commentDialogOpen} onOpenChange={setCommentDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Ajouter un commentaire</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedProject && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium">{selectedProject.name}</h4>
                <p className="text-sm text-gray-600">
                  {selectedProject.description}
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="commentAuthor">Auteur</Label>
              <Input
                id="commentAuthor"
                value={commentAuthor}
                onChange={(e) => setCommentAuthor(e.target.value)}
                placeholder="Votre nom"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="commentContent">Commentaire</Label>
              <Textarea
                id="commentContent"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Votre commentaire..."
                className="min-h-[100px]"
              />
            </div>

            {selectedProject && selectedProject.comments.length > 0 && (
              <div className="space-y-2">
                <Label>Historique des commentaires</Label>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {selectedProject.comments.map((comment) => (
                    <div key={comment.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium text-sm">
                          {comment.author}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(comment.createdAt).toLocaleDateString(
                            "fr-FR"
                          )}
                        </span>
                      </div>
                      <p className="text-sm">{comment.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setCommentDialogOpen(false)}
              >
                Annuler
              </Button>
              <Button
                onClick={handleAddComment}
                disabled={!newComment.trim() || !commentAuthor.trim()}
              >
                Ajouter
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Person Details Dialog */}
      <Dialog open={personDialogOpen} onOpenChange={setPersonDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Détails du porteur de projet</DialogTitle>
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
      {/* Project Details Dialog */}
      <ProjectDetailsDialog
        project={selectedProjectForDetails}
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        onPersonClick={openPersonDialog}
      />
    </div>
  );
}
