export type PersonStatus = "active" | "inactive" | "deleted"

export interface Person {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  status: PersonStatus
  createdAt: string
  updatedAt: string
}

export interface CreatePersonData {
  firstName: string
  lastName: string
  email: string
  phone?: string
  status?: PersonStatus
}

export interface UpdatePersonData {
  firstName: string
  lastName: string
  email: string
  phone?: string
  status: PersonStatus
}
