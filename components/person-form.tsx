"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import type { Person, PersonStatus } from "@/types/person"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface PersonFormProps {
  person?: Person | null
  onSubmit: (data: {
    firstName: string
    lastName: string
    email: string
    phone?: string
    status: PersonStatus
  }) => Promise<void>
  onCancel: () => void
}

export function PersonForm({ person, onSubmit, onCancel }: PersonFormProps) {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [status, setStatus] = useState<PersonStatus>("active")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (person) {
      setFirstName(person.firstName)
      setLastName(person.lastName)
      setEmail(person.email)
      setPhone(person.phone || "")
      setStatus(person.status)
    } else {
      setFirstName("")
      setLastName("")
      setEmail("")
      setPhone("")
      setStatus("active")
    }
    setError(null)
  }, [person])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!firstName.trim() || !lastName.trim() || !email.trim()) return

    setIsSubmitting(true)
    setError(null)

    try {
      await onSubmit({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        status,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-base font-medium">
              Prénom
            </Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Entrez le prénom"
              required
              disabled={isSubmitting}
              className="h-12 text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-base font-medium">
              Nom
            </Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Entrez le nom"
              required
              disabled={isSubmitting}
              className="h-12 text-base"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-base font-medium">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Entrez l'adresse email"
            required
            disabled={isSubmitting}
            className="h-12 text-base"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-base font-medium">
            Téléphone (optionnel)
          </Label>
          <Input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Entrez le numéro de téléphone"
            disabled={isSubmitting}
            className="h-12 text-base"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status" className="text-base font-medium">
            Statut
          </Label>
          <Select value={status} onValueChange={(value: PersonStatus) => setStatus(value)} disabled={isSubmitting}>
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
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting} className="h-12 text-base">
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !firstName.trim() || !lastName.trim() || !email.trim()}
            className="h-12 text-base"
          >
            {isSubmitting ? "Enregistrement..." : person ? "Modifier" : "Ajouter"}
          </Button>
        </div>
      </form>
    </div>
  )
}
