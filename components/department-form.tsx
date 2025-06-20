"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import type { Department } from "@/types/department";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DepartmentFormProps {
  department?: Department | null;
  onSubmit: (data: {
    name: string;
    shortName: string;
    status: DepartmentStatus;
  }) => Promise<void>;
  onCancel: () => void;
}

export type DepartmentStatus = "active" | "inactive" | "deleted";

export function DepartmentForm({
  department,
  onSubmit,
  onCancel,
}: DepartmentFormProps) {
  const [name, setName] = useState("");
  const [shortName, setShortName] = useState("");
  const [status, setStatus] = useState<DepartmentStatus>("active");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (department) {
      setName(department.name);
      setShortName(department.shortName);
      setStatus(department.status);
    } else {
      setName("");
      setShortName("");
      setStatus("active");
    }
    setError(null);
  }, [department]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !shortName.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit({
        name: name.trim(),
        shortName: shortName.trim(),
        status,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="name" className="text-base font-medium">
            Nom du département
          </Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Entrez le nom du département"
            required
            disabled={isSubmitting}
            className="h-12 text-base"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="shortName" className="text-base font-medium">
            Nom court
          </Label>
          <Input
            id="shortName"
            value={shortName}
            onChange={(e) => setShortName(e.target.value)}
            placeholder="Entrez le nom court (ex: RH, IT)"
            required
            disabled={isSubmitting}
            className="h-12 text-base"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status" className="text-base font-medium">
            Statut
          </Label>
          <Select
            value={status}
            onValueChange={(value: DepartmentStatus) => setStatus(value)}
            disabled={isSubmitting}
          >
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Sélectionnez un statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Actif</SelectItem>
              <SelectItem value="inactive">Inactif</SelectItem>
              <SelectItem value="deleted">Supprimé</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end space-y-2 space-y-reverse sm:space-y-0 sm:space-x-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="h-12 text-base"
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !name.trim() || !shortName.trim()}
            className="h-12 text-base"
          >
            {isSubmitting
              ? "Enregistrement..."
              : department
              ? "Modifier"
              : "Ajouter"}
          </Button>
        </div>
      </form>
    </div>
  );
}
