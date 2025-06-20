"use client";

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
import { Plus, Search, MoreHorizontal, Edit, Trash2, Eye } from "lucide-react";
import { DepartmentForm } from "./department-form";
import { MobileHeader } from "./mobile-header";
import { MobileDepartmentCard } from "./mobile-department-card";
import type { Department, DepartmentStatus } from "@/types/department";
import { useDepartments } from "@/hooks/use-departments";
import { useMediaQuery } from "@/hooks/use-media-query";
import * as XLSX from "xlsx";

export function DepartmentsPage() {
  const {
    departments,
    loading,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    addDepartment,
    updateDepartment,
    deleteDepartment,
    restoreDepartment,
  } = useDepartments();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(
    null
  );
  const isMobile = useMediaQuery("(max-width: 768px)");

  const handleAddDepartment = async (data: {
    name: string;
    shortName: string;
    status: DepartmentStatus;
  }) => {
    await addDepartment(data.name, data.shortName, data.status);
    setIsFormOpen(false);
  };

  const handleEditDepartment = async (data: {
    name: string;
    shortName: string;
    status: DepartmentStatus;
  }) => {
    if (editingDepartment) {
      await updateDepartment(
        editingDepartment.id,
        data.name,
        data.shortName,
        data.status
      );
      setEditingDepartment(null);
      setIsFormOpen(false);
    }
  };

  const handleDeleteDepartment = async (id: string) => {
    await deleteDepartment(id);
  };

  const handleRestoreDepartment = async (id: string) => {
    await restoreDepartment(id);
  };

  const openEditForm = (department: Department) => {
    setEditingDepartment(department);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingDepartment(null);
  };

  const handleExportExcel = () => {
    const exportData = departments.map((dept, index) => ({
      "N°": index + 1,
      ID: dept.id,
      "Nom du département": dept.name,
      "Nom court": dept.shortName,
      Statut:
        dept.status === "active"
          ? "Actif"
          : dept.status === "inactive"
          ? "Inactif"
          : "Supprimé",
      "Date de création": new Date(dept.createdAt).toLocaleDateString("fr-FR"),
      "Dernière modification": new Date(dept.updatedAt).toLocaleDateString(
        "fr-FR"
      ),
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);
    ws["!cols"] = [
      { wch: 5 },
      { wch: 18 },
      { wch: 28 },
      { wch: 12 },
      { wch: 12 },
      { wch: 18 },
      { wch: 22 },
    ];
    XLSX.utils.book_append_sheet(wb, ws, "Départements");

    const wbArray = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbArray], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const dateStr = new Date().toISOString().split("T")[0];
    const filename = `departements_${dateStr}.xlsx`;
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: DepartmentStatus) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Actif
          </Badge>
        );
      case "inactive":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Inactif
          </Badge>
        );
      case "deleted":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            Supprimé
          </Badge>
        );
      default:
        return <Badge variant="secondary">Inconnu</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileHeader onExportExcel={handleExportExcel} />

      <div className="p-4 md:p-6">
        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
          <h1 className="text-2xl font-bold text-gray-900">
            Liste des départements
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
                    placeholder="Rechercher un département..."
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
                    <Button
                      onClick={() => setEditingDepartment(null)}
                      className="w-full sm:w-auto h-12 md:h-10"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter un département
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>
                        {editingDepartment
                          ? "Modifier le département"
                          : "Ajouter un département"}
                      </DialogTitle>
                    </DialogHeader>
                    <DepartmentForm
                      department={editingDepartment}
                      onSubmit={
                        editingDepartment
                          ? handleEditDepartment
                          : handleAddDepartment
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
            ) : departments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 text-lg">
                  Aucun département trouvé
                </p>
              </div>
            ) : (
              <>
                {/* Mobile View - Cards */}
                <div className="md:hidden px-4 pb-4">
                  {departments.map((department) => (
                    <MobileDepartmentCard
                      key={department.id}
                      department={department}
                      onEdit={openEditForm}
                      onDelete={handleDeleteDepartment}
                      onRestore={handleRestoreDepartment}
                    />
                  ))}
                </div>

                {/* Desktop View - Table */}
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Nom du département</TableHead>
                        <TableHead>Nom court</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Date de création</TableHead>
                        <TableHead>Dernière modification</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {departments.map((department) => (
                        <TableRow key={department.id}>
                          <TableCell className="font-mono text-sm">
                            {department.id}
                          </TableCell>
                          <TableCell className="font-medium">
                            {department.name}
                          </TableCell>
                          <TableCell className="font-semibold text-blue-600">
                            {department.shortName}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(department.status)}
                          </TableCell>
                          <TableCell>
                            {new Date(department.createdAt).toLocaleDateString(
                              "fr-FR"
                            )}
                          </TableCell>
                          <TableCell>
                            {new Date(department.updatedAt).toLocaleDateString(
                              "fr-FR"
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
                                  onClick={() =>
                                    console.log("Voir", department.id)
                                  }
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  Voir
                                </DropdownMenuItem>
                                {department.status !== "deleted" && (
                                  <DropdownMenuItem
                                    onClick={() => openEditForm(department)}
                                  >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Modifier
                                  </DropdownMenuItem>
                                )}
                                {department.status === "deleted" ? (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleRestoreDepartment(department.id)
                                    }
                                  >
                                    <Eye className="h-4 w-4 mr-2" />
                                    Restaurer
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      handleDeleteDepartment(department.id)
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
    </div>
  );
}
