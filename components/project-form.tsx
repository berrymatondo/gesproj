"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, Star } from "lucide-react";
import type { Project, ProjectStatus } from "@/types/project";
import type { Person } from "@/types/person";

interface ProjectFormProps {
  project?: Project | null;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

export function ProjectForm({ project, onSubmit, onCancel }: ProjectFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [owner, setOwner] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [priority, setPriority] = useState(1);
  const [testLink, setTestLink] = useState("");
  const [status, setStatus] = useState<ProjectStatus>("new");
  const [referencePersonIds, setReferencePersonIds] = useState<string[]>([]);
  const [analystIds, setAnalystIds] = useState<string[]>([]);
  const [persons, setPersons] = useState<Person[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mettre à jour le formulaire pour supporter plusieurs porteurs
  const [ownerIds, setOwnerIds] = useState<string[]>([]);

  useEffect(() => {
    // Charger la liste des personnes
    const fetchPersons = async () => {
      try {
        const response = await fetch("/api/persons");
        if (response.ok) {
          const data = await response.json();
          setPersons(data.filter((p: any) => p.status === "active"));
        }
      } catch (error) {
        console.error("Erreur lors du chargement des personnes:", error);
      }
    };

    fetchPersons();
  }, []);

  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description || "");
      //setOwner(project.owner)
      setOwnerIds(project.owners.map((o) => o.id));
      setStartDate(project.startDate.split("T")[0]);
      setEndDate(project.endDate.split("T")[0]);
      setPriority(project.priority);
      setTestLink(project.testLink || "");
      setStatus(project.status);
      setReferencePersonIds(project.referencePersons.map((p) => p.id));
      setAnalystIds(project.analysts.map((p) => p.id));
    } else {
      setName("");
      setDescription("");
      //setOwner("")
      setOwnerIds([]);
      setStartDate("");
      setEndDate("");
      setPriority(1);
      setTestLink("");
      setStatus("new");
      setReferencePersonIds([]);
      setAnalystIds([]);
    }
    setError(null);
  }, [project]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !startDate || !endDate || ownerIds.length === 0) return;

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim() || undefined,
        //owner: owner.trim(),
        ownerIds,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        priority,
        testLink: testLink.trim() || undefined,
        status: status.toUpperCase(),
        referencePersonIds,
        analystIds,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (currentPriority: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <button
        key={i}
        type="button"
        onClick={() => setPriority(i + 1)}
        className={`p-1 ${
          i < currentPriority ? "text-yellow-400" : "text-gray-300"
        } hover:text-yellow-400`}
      >
        <Star className="h-5 w-5 fill-current" />
      </button>
    ));
  };

  return (
    <div className="p-4 max-h-[80vh] overflow-y-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-base font-medium">
              Dénomination *
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nom du projet"
              required
              disabled={isSubmitting}
              className="h-12 text-base"
            />
          </div>

          {/* Ajouter un champ pour sélectionner les porteurs de projet */}
          <div className="space-y-2">
            <Label className="text-base font-medium">
              Porteurs de projet *
            </Label>
            <div className="space-y-2 max-h-32 overflow-y-auto border rounded-md p-2">
              {persons.map((person) => (
                <div key={person.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`owner-${person.id}`}
                    checked={ownerIds.includes(person.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setOwnerIds([...ownerIds, person.id]);
                      } else {
                        setOwnerIds(ownerIds.filter((id) => id !== person.id));
                      }
                    }}
                    className="rounded"
                  />
                  <label htmlFor={`owner-${person.id}`} className="text-sm">
                    {person.firstName} {person.lastName}
                  </label>
                </div>
              ))}
            </div>
            {ownerIds.length === 0 && (
              <p className="text-sm text-red-500">
                Au moins un porteur de projet est requis
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-base font-medium">
            Description
          </Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description du projet"
            disabled={isSubmitting}
            className="min-h-[100px] text-base"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate" className="text-base font-medium">
              Date de début *
            </Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              disabled={isSubmitting}
              className="h-12 text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate" className="text-base font-medium">
              Date de fin *
            </Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
              disabled={isSubmitting}
              className="h-12 text-base"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-base font-medium">Priorité</Label>
            <div className="flex items-center space-x-1">
              {renderStars(priority)}
            </div>
            <p className="text-sm text-gray-500">
              Cliquez sur les étoiles pour définir la priorité
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status" className="text-base font-medium">
              Statut
            </Label>
            <Select
              value={status}
              onValueChange={(value: ProjectStatus) => setStatus(value)}
              disabled={isSubmitting}
            >
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Sélectionnez un statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">Nouveau</SelectItem>
                <SelectItem value="in_progress">En cours</SelectItem>
                <SelectItem value="delivered">Livré</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="testLink" className="text-base font-medium">
            Lien de test
          </Label>
          <Input
            id="testLink"
            type="url"
            value={testLink}
            onChange={(e) => setTestLink(e.target.value)}
            placeholder="https://example.com"
            disabled={isSubmitting}
            className="h-12 text-base"
          />
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
            disabled={
              isSubmitting ||
              !name.trim() ||
              !startDate ||
              !endDate ||
              ownerIds.length === 0
            }
            className="h-12 text-base"
          >
            {isSubmitting
              ? "Enregistrement..."
              : project
              ? "Modifier"
              : "Ajouter"}
          </Button>
        </div>
      </form>
    </div>
  );
}
