"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Star,
  Calendar,
  User,
  ExternalLink,
  MessageSquare,
  Users,
  Code,
  BarChart3,
  FileText,
} from "lucide-react";
import type { Project, ProjectStatus } from "@/types/project";
import type { Person } from "@/types/person";

interface ProjectDetailsDialogProps {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPersonClick: (person: Person) => void;
}

export function ProjectDetailsDialog({
  project,
  open,
  onOpenChange,
  onPersonClick,
}: ProjectDetailsDialogProps) {
  if (!project) return null;

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

  const PersonList = ({
    persons,
    icon: Icon,
    title,
  }: {
    persons: Person[];
    icon: any;
    title: string;
  }) => (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <Icon className="h-4 w-4 text-gray-500" />
        <h4 className="font-medium text-sm">{title}</h4>
      </div>
      {persons.length > 0 ? (
        <div className="space-y-1">
          {persons.map((person) => (
            <button
              key={person.id}
              onClick={() => onPersonClick(person)}
              className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-50 w-full text-left"
            >
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {person.firstName} {person.lastName}
                </p>
                <p className="text-xs text-gray-500 truncate">{person.email}</p>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">Aucun {title.toLowerCase()}</p>
      )}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Détails du projet</span>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <div className="space-y-6 p-1">
            {/* En-tête du projet */}
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {project.name}
                  </h2>
                  {project.description && (
                    <p className="text-gray-600 mt-2">{project.description}</p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(project.status)}
                  {project.deleted && (
                    <Badge variant="destructive">Supprimé</Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Du {new Date(project.startDate).toLocaleDateString("fr-FR")}{" "}
                    au {new Date(project.endDate).toLocaleDateString("fr-FR")}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <span>Priorité:</span>
                  <div className="flex items-center">
                    {renderStars(project.priority)}
                  </div>
                </div>
              </div>

              {project.testLink && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(project.testLink, "_blank")}
                  className="flex items-center space-x-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Accéder au test</span>
                </Button>
              )}
            </div>

            <Separator />

            {/* Équipe du projet */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PersonList
                persons={project.owners}
                icon={Users}
                title="Porteurs de projet"
              />
              <PersonList
                persons={project.analysts}
                icon={BarChart3}
                title="Analystes"
              />
              <PersonList
                persons={project.developers}
                icon={Code}
                title="Développeurs"
              />
              <PersonList
                persons={project.referencePersons}
                icon={User}
                title="Personnes de référence"
              />
            </div>

            <Separator />

            {/* Commentaires */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-4 w-4 text-gray-500" />
                <h4 className="font-medium">
                  Commentaires ({project.comments.length})
                </h4>
              </div>

              {project.comments.length > 0 ? (
                <div className="space-y-3">
                  {project.comments.map((comment) => (
                    <div key={comment.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-sm">
                          {comment.author}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(comment.createdAt).toLocaleDateString(
                            "fr-FR"
                          )}{" "}
                          à{" "}
                          {new Date(comment.createdAt).toLocaleTimeString(
                            "fr-FR",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{comment.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  Aucun commentaire pour ce projet
                </p>
              )}
            </div>

            <Separator />

            {/* Métadonnées */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">Créé le:</span>{" "}
                {new Date(project.createdAt).toLocaleDateString("fr-FR")} à{" "}
                {new Date(project.createdAt).toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
              <div>
                <span className="font-medium">Modifié le:</span>{" "}
                {new Date(project.updatedAt).toLocaleDateString("fr-FR")} à{" "}
                {new Date(project.updatedAt).toLocaleTimeString("fr-FR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
              <div>
                <span className="font-medium">ID:</span>{" "}
                <code className="text-xs bg-gray-100 px-1 rounded">
                  {project.id}
                </code>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
