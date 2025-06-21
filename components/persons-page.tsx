"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye, Mail, Phone } from "lucide-react"
import { PersonForm } from "./person-form"
import { MobileHeader } from "./mobile-header"
import { MobilePersonCard } from "./mobile-person-card"
import type { Person, PersonStatus } from "@/types/person"
import { usePersons } from "@/hooks/use-persons"
import { useMediaQuery } from "@/hooks/use-media-query"
import * as XLSX from "xlsx"

export function PersonsPage() {
  const {
    persons,
    loading,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    addPerson,
    updatePerson,
    deletePerson,
    restorePerson,
  } = usePersons()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingPerson, setEditingPerson] = useState<Person | null>(null)
  const isMobile = useMediaQuery("(max-width: 768px)")

  const handleAddPerson = async (data: {
    firstName: string
    lastName: string
    email: string
    phone?: string
    status: PersonStatus
  }) => {
    await addPerson(data.firstName, data.lastName, data.email, data.phone, data.status)
    setIsFormOpen(false)
  }

  const handleEditPerson = async (data: {
    firstName: string
    lastName: string
    email: string
    phone?: string
    status: PersonStatus
  }) => {
    if (editingPerson) {
      await updatePerson(editingPerson.id, data.firstName, data.lastName, data.email, data.phone, data.status)
      setEditingPerson(null)
      setIsFormOpen(false)
    }
  }

  const handleDeletePerson = async (id: string) => {
    await deletePerson(id)
  }

  const handleRestorePerson = async (id: string) => {
    await restorePerson(id)
  }

  const openEditForm = (person: Person) => {
    setEditingPerson(person)
    setIsFormOpen(true)
  }

  const closeForm = () => {
    setIsFormOpen(false)
    setEditingPerson(null)
  }

  const handleExportExcel = () => {
    const exportData = persons.map((person, index) => ({
      "N°": index + 1,
      ID: person.id,
      Prénom: person.firstName,
      Nom: person.lastName,
      Email: person.email,
      Téléphone: person.phone || "",
      Statut: person.status === "active" ? "Actif" : person.status === "inactive" ? "Inactif" : "Supprimé",
      "Date de création": new Date(person.createdAt).toLocaleDateString("fr-FR"),
      "Dernière modification": new Date(person.updatedAt).toLocaleDateString("fr-FR"),
    }))

    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(exportData)
    ws["!cols"] = [
      { wch: 5 },
      { wch: 18 },
      { wch: 15 },
      { wch: 15 },
      { wch: 25 },
      { wch: 15 },
      { wch: 12 },
      { wch: 18 },
      { wch: 22 },
    ]
    XLSX.utils.book_append_sheet(wb, ws, "Personnes")

    const wbArray = XLSX.write(wb, { bookType: "xlsx", type: "array" })
    const blob = new Blob([wbArray], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    })

    const dateStr = new Date().toISOString().split("T")[0]
    const filename = `personnes_${dateStr}.xlsx`
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

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
    <div className="min-h-screen bg-gray-50">
      <MobileHeader onExportExcel={handleExportExcel} />

      <div className="p-4 md:p-6">
        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
          <h1 className="text-2xl font-bold text-gray-900">Liste des personnes</h1>
        </div>

        <Card>
          <CardHeader className="pb-4">
            {/* Search and Filters */}
            <div className="flex flex-col space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Rechercher une personne..."
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
                    <SelectItem value="active">Actif</SelectItem>
                    <SelectItem value="inactive">Inactif</SelectItem>
                    <SelectItem value="deleted">Supprimé</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Add Button */}
              <div className="flex justify-end">
                <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setEditingPerson(null)} className="w-full sm:w-auto h-12 md:h-10">
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter une personne
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                      <DialogTitle>{editingPerson ? "Modifier la personne" : "Ajouter une personne"}</DialogTitle>
                    </DialogHeader>
                    <PersonForm
                      person={editingPerson}
                      onSubmit={editingPerson ? handleEditPerson : handleAddPerson}
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
            ) : persons.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 text-lg">Aucune personne trouvée</p>
              </div>
            ) : (
              <>
                {/* Mobile View - Cards */}
                <div className="md:hidden px-4 pb-4">
                  {persons.map((person) => (
                    <MobilePersonCard
                      key={person.id}
                      person={person}
                      onEdit={openEditForm}
                      onDelete={handleDeletePerson}
                      onRestore={handleRestorePerson}
                    />
                  ))}
                </div>

                {/* Desktop View - Table */}
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nom complet</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Téléphone</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Date de création</TableHead>
                        <TableHead>Dernière modification</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {persons.map((person) => (
                        <TableRow key={person.id}>
                          <TableCell className="font-medium">
                            {person.firstName} {person.lastName}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Mail className="h-4 w-4 text-gray-400" />
                              <span>{person.email}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {person.phone ? (
                              <div className="flex items-center space-x-2">
                                <Phone className="h-4 w-4 text-gray-400" />
                                <span>{person.phone}</span>
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </TableCell>
                          <TableCell>{getStatusBadge(person.status)}</TableCell>
                          <TableCell>{new Date(person.createdAt).toLocaleDateString("fr-FR")}</TableCell>
                          <TableCell>{new Date(person.updatedAt).toLocaleDateString("fr-FR")}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => console.log("Voir", person.id)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Voir
                                </DropdownMenuItem>
                                {person.status !== "deleted" && (
                                  <DropdownMenuItem onClick={() => openEditForm(person)}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Modifier
                                  </DropdownMenuItem>
                                )}
                                {person.status === "deleted" ? (
                                  <DropdownMenuItem onClick={() => handleRestorePerson(person.id)}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    Restaurer
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem
                                    onClick={() => handleDeletePerson(person.id)}
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
    </div>
  )
}
