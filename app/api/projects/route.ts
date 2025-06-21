import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Mettre à jour le schéma de validation
const createProjectSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  description: z.string().optional(),
  ownerIds: z
    .array(z.string())
    .min(1, "Au moins un porteur de projet est requis"),
  startDate: z.string().datetime("Date de début invalide"),
  endDate: z.string().datetime("Date de fin invalide"),
  priority: z.number().min(1).max(5, "La priorité doit être entre 1 et 5"),
  testLink: z
    .string()
    .url("Lien de test invalide")
    .optional()
    .or(z.literal("")),
  status: z.enum(["NEW", "IN_PROGRESS", "DELIVERED"]).optional().default("NEW"),
  referencePersonIds: z.array(z.string()).optional().default([]),
  analystIds: z.array(z.string()).optional().default([]),
  developerIds: z.array(z.string()).optional().default([]), // Ajouter cette ligne
});

const querySchema = z.object({
  search: z.string().optional(),
  status: z.enum(["NEW", "IN_PROGRESS", "DELIVERED", "all"]).optional(),
  includeDeleted: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const { search, status, includeDeleted } = querySchema.parse({
      search: searchParams.get("search") || undefined,
      status: searchParams.get("status") || undefined,
      includeDeleted: searchParams.get("includeDeleted") || undefined,
    });

    const where: any = {};

    if (!includeDeleted) {
      where.deleted = false;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        {
          owners: {
            some: {
              person: {
                OR: [
                  { firstName: { contains: search, mode: "insensitive" } },
                  { lastName: { contains: search, mode: "insensitive" } },
                ],
              },
            },
          },
        },
      ];
    }

    if (status && status !== "all") {
      where.status = status;
    }

    // Mettre à jour la requête GET pour inclure les owners
    const projects = await prisma.project.findMany({
      where,
      include: {
        owners: {
          include: {
            person: true,
          },
        },
        referencePersons: {
          include: {
            person: true,
          },
        },
        analysts: {
          include: {
            person: true,
          },
        },
        developers: {
          // Ajouter cette section
          include: {
            person: true,
          },
        },
        comments: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    });

    // Mettre à jour la transformation des données
    const transformedProjects = projects.map((project) => ({
      id: project.id,
      name: project.name,
      description: project.description,
      owners: project.owners.map((owner) => ({
        id: owner.person.id,
        firstName: owner.person.firstName,
        lastName: owner.person.lastName,
        email: owner.person.email,
        phone: owner.person.phone,
        status: owner.person.status.toLowerCase(),
      })),
      startDate: project.startDate.toISOString(),
      endDate: project.endDate.toISOString(),
      priority: project.priority,
      testLink: project.testLink,
      status: project.status.toLowerCase(),
      deleted: project.deleted,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
      referencePersons: project.referencePersons.map((ref) => ({
        id: ref.person.id,
        firstName: ref.person.firstName,
        lastName: ref.person.lastName,
        email: ref.person.email,
        phone: ref.person.phone,
        status: ref.person.status.toLowerCase(),
      })),
      analysts: project.analysts.map((analyst) => ({
        id: analyst.person.id,
        firstName: analyst.person.firstName,
        lastName: analyst.person.lastName,
        email: analyst.person.email,
        phone: analyst.person.phone,
        status: analyst.person.status.toLowerCase(),
      })),
      developers: project.developers.map((developer) => ({
        // Ajouter cette section
        id: developer.person.id,
        firstName: developer.person.firstName,
        lastName: developer.person.lastName,
        email: developer.person.email,
        phone: developer.person.phone,
        status: developer.person.status.toLowerCase(),
      })),
      comments: project.comments.map((comment) => ({
        id: comment.id,
        content: comment.content,
        author: comment.author,
        createdAt: comment.createdAt.toISOString(),
      })),
      lastComment: project.comments[0]
        ? {
            id: project.comments[0].id,
            content: project.comments[0].content,
            author: project.comments[0].author,
            createdAt: project.comments[0].createdAt.toISOString(),
          }
        : undefined,
    }));

    return NextResponse.json(transformedProjects);
  } catch (error) {
    console.error("Erreur lors de la récupération des projets:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des projets" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Mettre à jour la création de projet
    const {
      name,
      description,
      ownerIds,
      startDate,
      endDate,
      priority,
      testLink,
      status,
      referencePersonIds,
      analystIds,
      developerIds,
    } = createProjectSchema.parse(body);

    // Validation des dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start >= end) {
      return NextResponse.json(
        { error: "La date de fin doit être postérieure à la date de début" },
        { status: 400 }
      );
    }

    const project = await prisma.project.create({
      data: {
        name,
        description,
        startDate: start,
        endDate: end,
        priority,
        testLink: testLink || null,
        status: status || "NEW",
        owners: {
          create: ownerIds.map((personId) => ({
            personId,
          })),
        },
        referencePersons: {
          create: referencePersonIds.map((personId) => ({
            personId,
          })),
        },
        analysts: {
          create: analystIds.map((personId) => ({
            personId,
          })),
        },
        developers: {
          // Ajouter cette section
          create: developerIds.map((personId) => ({
            personId,
          })),
        },
      },
      include: {
        owners: {
          include: {
            person: true,
          },
        },
        referencePersons: {
          include: {
            person: true,
          },
        },
        analysts: {
          include: {
            person: true,
          },
        },
        developers: {
          // Ajouter cette section
          include: {
            person: true,
          },
        },
        comments: true,
      },
    });

    const transformedProject = {
      id: project.id,
      name: project.name,
      description: project.description,
      owners: project.owners.map((owner) => ({
        id: owner.person.id,
        firstName: owner.person.firstName,
        lastName: owner.person.lastName,
        email: owner.person.email,
        phone: owner.person.phone,
        status: owner.person.status.toLowerCase(),
      })),
      startDate: project.startDate.toISOString(),
      endDate: project.endDate.toISOString(),
      priority: project.priority,
      testLink: project.testLink,
      status: project.status.toLowerCase(),
      deleted: project.deleted,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
      referencePersons: project.referencePersons.map((ref) => ({
        id: ref.person.id,
        firstName: ref.person.firstName,
        lastName: ref.person.lastName,
        email: ref.person.email,
      })),
      analysts: project.analysts.map((analyst) => ({
        id: analyst.person.id,
        firstName: analyst.person.firstName,
        lastName: analyst.person.lastName,
        email: analyst.person.email,
      })),
      developers: project.developers.map((developer) => ({
        id: developer.person.id,
        firstName: developer.person.firstName,
        lastName: developer.person.lastName,
        email: developer.person.email,
      })),
      comments: [],
    };

    return NextResponse.json(transformedProject, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Erreur lors de la création du projet:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du projet" },
      { status: 500 }
    );
  }
}
