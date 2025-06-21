"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreVertical, Edit, Trash2, Eye, Mail, Phone } from "lucide-react"
import type { Person, PersonStatus } from "@/types/person"

interface MobilePersonCardProps {
  person: Person
  onEdit: (person: Person) => void
  onDelete: (id: string) => void
  onRestore: (id: string) => void
}

export function MobilePersonCard({ person, onEdit, onDelete, onRestore }: MobilePersonCardProps) {
  const getStatusBadge = (status: PersonStatus) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Actif</Badge>
      case "inactive":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Inactif</Badge>
      case "deleted":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Supprimé</Badge>
      default:
        return <Badge variant="secondary">Inconnu</Badge>
    }
  }

  return (
    <Card className="mb-3">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="font-semibold text-gray-900 truncate">
                {person.firstName} {person.lastName}
              </h3>
            </div>

            <div className="flex items-center space-x-2 mb-2">{getStatusBadge(person.status)}</div>

            <div className="text-sm text-gray-600 space-y-1">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span className="truncate">{person.email}</span>
              </div>
              {person.phone && (
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>{person.phone}</span>
                </div>
              )}
            </div>

            <div className="text-xs text-gray-500 space-y-1 mt-2">
              <div>
                ID: <span className="font-mono">{person.id}</span>
              </div>
              <div>Créé: {new Date(person.createdAt).toLocaleDateString("fr-FR")}</div>
              <div>Modifié: {new Date(person.updatedAt).toLocaleDateString("fr-FR")}</div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => console.log("Voir", person.id)}>
                <Eye className="h-4 w-4 mr-2" />
                Voir
              </DropdownMenuItem>
              {person.status !== "deleted" && (
                <DropdownMenuItem onClick={() => onEdit(person)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier
                </DropdownMenuItem>
              )}
              {person.status === "deleted" ? (
                <DropdownMenuItem onClick={() => onRestore(person.id)}>
                  <Eye className="h-4 w-4 mr-2" />
                  Restaurer
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => onDelete(person.id)} className="text-red-600">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  )
}
