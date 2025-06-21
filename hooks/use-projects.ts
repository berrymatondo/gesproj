"use client"

import { useState, useEffect, useMemo } from "react"
import type { Project } from "@/types/project"

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [showDeleted, setShowDeleted] = useState(false)

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchTerm) params.append("search", searchTerm)
      if (statusFilter !== "all") params.append("status", statusFilter.toUpperCase())
      if (showDeleted) params.append("includeDeleted", "true")

      const response = await fetch(`/api/projects?${params.toString()}`)
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des projets")
      }

      const data = await response.json()
      setProjects(data)
    } catch (error) {
      console.error("Erreur:", error)
      setProjects([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [searchTerm, statusFilter, showDeleted])

  const filteredProjects = useMemo(() => projects, [projects])

  const addProject = async (projectData: any) => {
    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(projectData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erreur lors de la création du projet")
      }

      await fetchProjects()
    } catch (error) {
      console.error("Erreur lors de l'ajout:", error)
      throw error
    }
  }

  const updateProject = async (id: string, projectData: any) => {
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(projectData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erreur lors de la mise à jour du projet")
      }

      await fetchProjects()
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error)
      throw error
    }
  }

  const deleteProject = async (id: string) => {
    try {
      const response = await fetch(`/api/projects/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erreur lors de la suppression du projet")
      }

      await fetchProjects()
    } catch (error) {
      console.error("Erreur lors de la suppression:", error)
      throw error
    }
  }

  const restoreProject = async (id: string) => {
    try {
      const response = await fetch(`/api/projects/${id}/restore`, {
        method: "POST",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erreur lors de la restauration du projet")
      }

      await fetchProjects()
    } catch (error) {
      console.error("Erreur lors de la restauration:", error)
      throw error
    }
  }

  const addComment = async (projectId: string, content: string, author: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content, author }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erreur lors de l'ajout du commentaire")
      }

      await fetchProjects()
    } catch (error) {
      console.error("Erreur lors de l'ajout du commentaire:", error)
      throw error
    }
  }

  return {
    projects: filteredProjects,
    loading,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    showDeleted,
    setShowDeleted,
    addProject,
    updateProject,
    deleteProject,
    restoreProject,
    addComment,
    refetch: fetchProjects,
  }
}
