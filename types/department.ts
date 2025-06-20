export type DepartmentStatus = "active" | "inactive" | "deleted"

export interface Department {
  id: string
  name: string
  shortName: string
  status: DepartmentStatus
  createdAt: string
  updatedAt: string
}

export interface CreateDepartmentData {
  name: string
  shortName: string
}

export interface UpdateDepartmentData {
  name: string
  shortName: string
}
