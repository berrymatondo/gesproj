import type { PersonStatus } from "./person";

export type ProjectStatus = "new" | "in_progress" | "delivered";

export interface Person {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  status: PersonStatus; // Changé de string vers PersonStatus
  createdAt: string;
  updatedAt: string;
}

export interface ProjectComment {
  id: string;
  content: string;
  author: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  owners: Person[]; // Changé de owner: string vers owners: Person[]
  startDate: string;
  endDate: string;
  priority: number;
  testLink?: string;
  status: ProjectStatus;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
  referencePersons: Person[];
  analysts: Person[];
  developers: Person[]; // Ajouter cette ligne
  comments: ProjectComment[];
  lastComment?: ProjectComment;
}

export interface CreateProjectData {
  name: string;
  description?: string;
  ownerIds: string[]; // Changé de owner vers ownerIds
  startDate: string;
  endDate: string;
  priority: number;
  testLink?: string;
  status: ProjectStatus;
  referencePersonIds: string[];
  analystIds: string[];
  developerIds: string[]; // Ajouter cette ligne
}

export interface UpdateProjectData extends CreateProjectData {
  deleted?: boolean;
}

export interface ProjectPersonDeveloper {
  id: string;
  projectId: string;
  personId: string;
  project: Project;
  person: Person;
}
