"use client"

import { useState, useEffect, useMemo } from "react"
import type { Person, PersonStatus } from "@/types/person"

export function usePersons() {
  const [persons, setPersons] = useState<Person[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const fetchPersons = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchTerm) params.append("search", searchTerm)
      if (statusFilter !== "all") params.append("status", statusFilter.toUpperCase())

      const response = await fetch(`/api/persons?${params.toString()}`)
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des personnes")
      }

      const data = await response.json()
      setPersons(data)
    } catch (error) {
      console.error("Erreur:", error)
      setPersons([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPersons()
  }, [searchTerm, statusFilter])

  const filteredPersons = useMemo(() => persons, [persons])

  const addPerson = async (
    firstName: string,
    lastName: string,
    email: string,
    phone?: string,
    status: PersonStatus = "active",
  ) => {
    try {
      const response = await fetch("/api/persons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ firstName, lastName, email, phone, status: status.toUpperCase() }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erreur lors de la création de la personne")
      }

      await fetchPersons()
    } catch (error) {
      console.error("Erreur lors de l'ajout:", error)
      throw error
    }
  }

  const updatePerson = async (
    id: string,
    firstName: string,
    lastName: string,
    email: string,
    phone: string | undefined,
    status: PersonStatus,
  ) => {
    try {
      const response = await fetch(`/api/persons/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          status: status.toUpperCase(),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erreur lors de la mise à jour de la personne")
      }

      await fetchPersons()
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error)
      throw error
    }
  }

  const deletePerson = async (id: string) => {
    try {
      const response = await fetch(`/api/persons/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erreur lors de la suppression de la personne")
      }

      await fetchPersons()
    } catch (error) {
      console.error("Erreur lors de la suppression:", error)
      throw error
    }
  }

  const restorePerson = async (id: string) => {
    try {
      const response = await fetch(`/api/persons/${id}/restore`, {
        method: "POST",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erreur lors de la restauration de la personne")
      }

      await fetchPersons()
    } catch (error) {
      console.error("Erreur lors de la restauration:", error)
      throw error
    }
  }

  return {
    persons: filteredPersons,
    loading,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    addPerson,
    updatePerson,
    deletePerson,
    restorePerson,
    refetch: fetchPersons,
  }
}
