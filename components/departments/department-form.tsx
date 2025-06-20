"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Department {
  id: number;
  nom: string;
  acronyme?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface DepartmentFormProps {
  department?: Department | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (nom: string, acronyme?: string) => Promise<void>;
}

export function DepartmentForm({
  department,
  isOpen,
  onClose,
  onSubmit,
}: DepartmentFormProps) {
  const [nom, setNom] = useState("");
  const [acronyme, setAcronyme] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Réinitialiser les champs quand le département change ou quand la modal s'ouvre
  useEffect(() => {
    if (isOpen) {
      setNom(department?.nom || "");
      setAcronyme(department?.acronyme || "");
    }
  }, [department, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nom.trim()) {
      return;
    }

    setIsLoading(true);

    try {
      await onSubmit(nom.trim(), acronyme.trim() || undefined);
      handleClose();
    } catch (error) {
      // L'erreur est gérée dans le hook useDepartments
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
      // Réinitialiser les champs après fermeture
      setTimeout(() => {
        setNom("");
        setAcronyme("");
      }, 150); // Petit délai pour éviter le flash visuel
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {department ? "Modifier le département" : "Nouveau département"}
          </DialogTitle>
          <DialogDescription>
            {department
              ? "Modifiez les informations du département"
              : "Créez un nouveau département en renseignant les informations ci-dessous"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nom" className="text-right">
                Nom <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nom"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                className="col-span-3"
                placeholder="Nom du département"
                disabled={isLoading}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="acronyme" className="text-right">
                Acronyme
              </Label>
              <Input
                id="acronyme"
                value={acronyme}
                onChange={(e) => setAcronyme(e.target.value.toUpperCase())}
                className="col-span-3"
                placeholder="Acronyme (optionnel)"
                disabled={isLoading}
                maxLength={10}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading || !nom.trim()}>
              {isLoading
                ? "Enregistrement..."
                : department
                ? "Modifier"
                : "Créer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
