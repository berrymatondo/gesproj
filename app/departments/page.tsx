"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DepartmentForm } from "@/components/departments/department-form";
import { DepartmentsTable } from "@/components/departments/departments-table";
import { Plus, Search, Download, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useDepartments } from "@/hooks/use-departments";

interface Department {
  id: number;
  nom: string;
  acronyme?: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function DepartmentsPage() {
  const {
    departments,
    isLoading,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    refreshDepartments,
  } = useDepartments();

  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(
    null
  );
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  // Filtrage des départements en temps réel
  const filteredDepartments = useMemo(() => {
    if (!searchTerm.trim()) return departments;

    const searchLower = searchTerm.toLowerCase();
    return departments.filter(
      (dept) =>
        dept.nom.toLowerCase().includes(searchLower) ||
        dept.acronyme?.toLowerCase().includes(searchLower)
    );
  }, [departments, searchTerm]);

  const handleEdit = (department: Department) => {
    setEditingDepartment(department);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingDepartment(null);
  };

  const handleFormSubmit = async (nom: string, acronyme?: string) => {
    if (editingDepartment) {
      await updateDepartment(editingDepartment.id, nom, acronyme);
    } else {
      await createDepartment(nom, acronyme);
    }
  };

  const handleDelete = async (id: number) => {
    await deleteDepartment(id);
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const searchParams = new URLSearchParams();
      if (searchTerm) {
        searchParams.append("search", searchTerm);
      }

      const response = await fetch(`/api/departments/export?${searchParams}`);
      if (!response.ok) {
        throw new Error("Erreur lors de l'export");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `departements_${
        new Date().toISOString().split("T")[0]
      }.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Succès",
        description: "Export Excel téléchargé avec succès",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description:
          error instanceof Error ? error.message : "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">
                Gestion des Départements
              </CardTitle>
              <CardDescription>
                Gérez les départements de votre organisation
                {departments.length > 0 && (
                  <span className="ml-2 text-sm">
                    • {departments.length} département
                    {departments.length > 1 ? "s" : ""} au total
                  </span>
                )}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={refreshDepartments}
                disabled={isLoading}
                size="sm"
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
                />
                Actualiser
              </Button>
              <Button
                variant="outline"
                onClick={handleExport}
                disabled={isExporting || filteredDepartments.length === 0}
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                {isExporting ? "Export..." : "Exporter"}
              </Button>
              <Button onClick={() => setIsFormOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nouveau Département
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom ou acronyme..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <div className="text-sm text-muted-foreground ml-4">
              {filteredDepartments.length} département
              {filteredDepartments.length > 1 ? "s" : ""} trouvé
              {filteredDepartments.length > 1 ? "s" : ""}
              {searchTerm &&
                filteredDepartments.length !== departments.length && (
                  <span className="ml-1">sur {departments.length}</span>
                )}
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                Chargement des départements ...
              </p>
            </div>
          ) : (
            <DepartmentsTable
              departments={filteredDepartments}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </CardContent>
      </Card>

      <DepartmentForm
        department={editingDepartment}
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
}
