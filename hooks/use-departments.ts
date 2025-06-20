"use client";

import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

interface Department {
  id: number;
  nom: string;
  acronyme?: string | null;
  createdAt: string;
  updatedAt: string;
}

export function useDepartments() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchDepartments = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/departments");
      if (!response.ok) {
        throw new Error("Erreur lors du chargement des départements");
      }
      const data = await response.json();
      setDepartments(data);
      return data;
    } catch (error) {
      toast({
        title: "Erreur",
        description:
          error instanceof Error ? error.message : "Une erreur est survenue",
        variant: "destructive",
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  const createDepartment = useCallback(
    async (nom: string, acronyme?: string) => {
      try {
        const response = await fetch("/api/departments", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nom: nom.trim(),
            acronyme: acronyme?.trim() || null,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Une erreur est survenue");
        }

        const newDepartment = await response.json();

        // Mise à jour optimiste de l'état local
        setDepartments((prev) => [newDepartment, ...prev]);

        toast({
          title: "Succès",
          description: "Département créé avec succès",
        });

        return newDepartment;
      } catch (error) {
        toast({
          title: "Erreur",
          description:
            error instanceof Error ? error.message : "Une erreur est survenue",
          variant: "destructive",
        });
        throw error;
      }
    },
    [toast]
  );

  const updateDepartment = useCallback(
    async (id: number, nom: string, acronyme?: string) => {
      try {
        const response = await fetch(`/api/departments/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nom: nom.trim(),
            acronyme: acronyme?.trim() || null,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Une erreur est survenue");
        }

        const updatedDepartment = await response.json();

        // Mise à jour optimiste de l'état local
        setDepartments((prev) =>
          prev.map((dept) => (dept.id === id ? updatedDepartment : dept))
        );

        toast({
          title: "Succès",
          description: "Département modifié avec succès",
        });

        return updatedDepartment;
      } catch (error) {
        toast({
          title: "Erreur",
          description:
            error instanceof Error ? error.message : "Une erreur est survenue",
          variant: "destructive",
        });
        throw error;
      }
    },
    [toast]
  );

  const deleteDepartment = useCallback(
    async (id: number) => {
      try {
        const response = await fetch(`/api/departments/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Une erreur est survenue");
        }

        // Mise à jour optimiste de l'état local
        setDepartments((prev) => prev.filter((dept) => dept.id !== id));

        toast({
          title: "Succès",
          description: "Département supprimé avec succès",
        });

        return true;
      } catch (error) {
        toast({
          title: "Erreur",
          description:
            error instanceof Error ? error.message : "Une erreur est survenue",
          variant: "destructive",
        });
        throw error;
      }
    },
    [toast]
  );

  const refreshDepartments = useCallback(() => {
    return fetchDepartments();
  }, [fetchDepartments]);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  return {
    departments,
    isLoading,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    refreshDepartments,
  };
}
