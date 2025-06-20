"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreVertical, Edit, Trash2, Eye } from "lucide-react"
import type { Department, DepartmentStatus } from "@/types/department"

interface MobileDepartmentCardProps {
  department: Department
  onEdit: (department: Department) => void
  onDelete: (id: string) => void
  onRestore: (id: string) => void
}

export function MobileDepartmentCard({ department, onEdit, onDelete, onRestore }: MobileDepartmentCardProps) {
  const getStatusBadge = (status: DepartmentStatus) => {
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
              <h3 className="font-semibold text-gray-900 truncate">{department.name}</h3>
              <span className="font-semibold text-blue-600 text-sm">{department.shortName}</span>
            </div>

            <div className="flex items-center space-x-2 mb-2">{getStatusBadge(department.status)}</div>

            <div className="text-xs text-gray-500 space-y-1">
              <div>
                ID: <span className="font-mono">{department.id}</span>
              </div>
              <div>Créé: {new Date(department.createdAt).toLocaleDateString("fr-FR")}</div>
              <div>Modifié: {new Date(department.updatedAt).toLocaleDateString("fr-FR")}</div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => console.log("Voir", department.id)}>
                <Eye className="h-4 w-4 mr-2" />
                Voir
              </DropdownMenuItem>
              {department.status !== "deleted" && (
                <DropdownMenuItem onClick={() => onEdit(department)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier
                </DropdownMenuItem>
              )}
              {department.status === "deleted" ? (
                <DropdownMenuItem onClick={() => onRestore(department.id)}>
                  <Eye className="h-4 w-4 mr-2" />
                  Restaurer
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => onDelete(department.id)} className="text-red-600">
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
