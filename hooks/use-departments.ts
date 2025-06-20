"use client"

import { useState, useEffect, useMemo } from "react"
import type { Department } from "@/types/department"

export function useDepartments() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const fetchDepartments = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchTerm) params.append("search", searchTerm)
      if (statusFilter !== "all") params.append("status", statusFilter.toUpperCase())

      const response = await fetch(`/api/departments?${params.toString()}`)
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des départements")
      }

      const data = await response.json()
      setDepartments(data)
    } catch (error) {
      console.error("Erreur:", error)
      setDepartments([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDepartments()
  }, [searchTerm, statusFilter])

  const filteredDepartments = useMemo(() => departments, [departments])

  const addDepartment = async (name: string, shortName: string) => {
    try {
      const response = await fetch("/api/departments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, shortName }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erreur lors de la création du département")
      }

      await fetchDepartments()
    } catch (error) {
      console.error("Erreur lors de l'ajout:", error)
      throw error
    }
  }

  const updateDepartment = async (id: string, name: string, shortName: string) => {
    try {
      const response = await fetch(`/api/departments/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, shortName }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erreur lors de la mise à jour du département")
      }

      await fetchDepartments()
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error)
      throw error
    }
  }

  const deleteDepartment = async (id: string) => {
    try {
      const response = await fetch(`/api/departments/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erreur lors de la suppression du département")
      }

      await fetchDepartments()
    } catch (error) {
      console.error("Erreur lors de la suppression:", error)
      throw error
    }
  }

  const restoreDepartment = async (id: string) => {
    try {
      const response = await fetch(`/api/departments/${id}/restore`, {
        method: "POST",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erreur lors de la restauration du département")
      }

      await fetchDepartments()
    } catch (error) {
      console.error("Erreur lors de la restauration:", error)
      throw error
    }
  }

  return {
    departments: filteredDepartments,
    loading,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    addDepartment,
    updateDepartment,
    deleteDepartment,
    restoreDepartment,
    refetch: fetchDepartments,
  }
}
