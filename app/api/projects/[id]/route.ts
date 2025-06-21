import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Mettre à jour le schéma de validation
const updateProjectSchema = z.object({
  name: z.string().min(1, "Le nom est requis").optional(),
  description: z.string().optional(),
  ownerIds: z
    .array(z.string())
    .min(1, "Au moins un porteur de projet est requis")
    .optional(),
  startDate: z.string().datetime("Date de début invalide").optional(),
  endDate: z.string().datetime("Date de fin invalide").optional(),
  priority: z
    .number()
    .min(1)
    .max(5, "La priorité doit être entre 1 et 5")
    .optional(),
  testLink: z
    .string()
    .url("Lien de test invalide")
    .optional()
    .or(z.literal("")),
  status: z.enum(["NEW", "IN_PROGRESS", "DELIVERED"]).optional(),
  referencePersonIds: z.array(z.string()).optional(),
  analystIds: z.array(z.string()).optional(),
  developerIds: z.array(z.string()).optional(), // Ajouter cette ligne
  deleted: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;

    const project = await prisma.project.findUnique({
      where: { id },
      // Mettre à jour les includes pour GET et PUT
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
          // Ajouter cette section partout
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
    });

    if (!project) {
      return NextResponse.json({ error: "Projet non trouvé" }, { status: 404 });
    }

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
        phone: developer.person.phone,
        status: developer.person.status.toLowerCase(),
      })),
      comments: project.comments.map((comment) => ({
        id: comment.id,
        content: comment.content,
        author: comment.author,
        createdAt: comment.createdAt.toISOString(),
      })),
    };

    return NextResponse.json(transformedProject);
  } catch (error) {
    console.error("Erreur lors de la récupération du projet:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du projet" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updateData = updateProjectSchema.parse(body);

    const existingProject = await prisma.project.findUnique({
      where: { id },
    });

    if (!existingProject) {
      return NextResponse.json({ error: "Projet non trouvé" }, { status: 404 });
    }

    // Validation des dates si elles sont fournies
    if (updateData.startDate && updateData.endDate) {
      const start = new Date(updateData.startDate);
      const end = new Date(updateData.endDate);
      if (start >= end) {
        return NextResponse.json(
          { error: "La date de fin doit être postérieure à la date de début" },
          { status: 400 }
        );
      }
    }

    // Préparer les données de mise à jour
    const dataToUpdate: any = {};
    if (updateData.name !== undefined) dataToUpdate.name = updateData.name;
    if (updateData.description !== undefined)
      dataToUpdate.description = updateData.description;
    if (updateData.startDate !== undefined)
      dataToUpdate.startDate = new Date(updateData.startDate);
    if (updateData.endDate !== undefined)
      dataToUpdate.endDate = new Date(updateData.endDate);
    if (updateData.priority !== undefined)
      dataToUpdate.priority = updateData.priority;
    if (updateData.testLink !== undefined)
      dataToUpdate.testLink = updateData.testLink || null;
    if (updateData.status !== undefined)
      dataToUpdate.status = updateData.status;
    if (updateData.deleted !== undefined)
      dataToUpdate.deleted = updateData.deleted;

    const project = await prisma.project.update({
      where: { id },
      data: dataToUpdate,
      // Mettre à jour les includes pour GET et PUT
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
          // Ajouter cette section partout
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
    });

    // Ajouter la gestion des owners dans la mise à jour
    if (updateData.ownerIds !== undefined) {
      await prisma.projectPersonOwner.deleteMany({
        where: { projectId: id },
      });
      if (updateData.ownerIds.length > 0) {
        await prisma.projectPersonOwner.createMany({
          data: updateData.ownerIds.map((personId) => ({
            projectId: id,
            personId,
          })),
        });
      }
    }

    // Mettre à jour les relations si nécessaire
    if (updateData.referencePersonIds !== undefined) {
      await prisma.projectPersonReference.deleteMany({
        where: { projectId: id },
      });
      if (updateData.referencePersonIds.length > 0) {
        await prisma.projectPersonReference.createMany({
          data: updateData.referencePersonIds.map((personId) => ({
            projectId: id,
            personId,
          })),
        });
      }
    }

    if (updateData.analystIds !== undefined) {
      await prisma.projectPersonAnalyst.deleteMany({
        where: { projectId: id },
      });
      if (updateData.analystIds.length > 0) {
        await prisma.projectPersonAnalyst.createMany({
          data: updateData.analystIds.map((personId) => ({
            projectId: id,
            personId,
          })),
        });
      }
    }

    // Ajouter après la gestion des analysts
    if (updateData.developerIds !== undefined) {
      await prisma.projectPersonDeveloper.deleteMany({
        where: { projectId: id },
      });
      if (updateData.developerIds.length > 0) {
        await prisma.projectPersonDeveloper.createMany({
          data: updateData.developerIds.map((personId) => ({
            projectId: id,
            personId,
          })),
        });
      }
    }

    // Récupérer le projet mis à jour avec les nouvelles relations
    const updatedProject = await prisma.project.findUnique({
      where: { id },
      // Mettre à jour les includes pour GET et PUT
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
          // Ajouter cette section partout
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
    });

    const transformedProject = {
      id: updatedProject!.id,
      name: updatedProject!.name,
      description: updatedProject!.description,
      owners: updatedProject!.owners.map((owner) => ({
        id: owner.person.id,
        firstName: owner.person.firstName,
        lastName: owner.person.lastName,
        email: owner.person.email,
        phone: owner.person.phone,
        status: owner.person.status.toLowerCase(),
      })),
      startDate: updatedProject!.startDate.toISOString(),
      endDate: updatedProject!.endDate.toISOString(),
      priority: updatedProject!.priority,
      testLink: updatedProject!.testLink,
      status: updatedProject!.status.toLowerCase(),
      deleted: updatedProject!.deleted,
      createdAt: updatedProject!.createdAt.toISOString(),
      updatedAt: updatedProject!.updatedAt.toISOString(),
      referencePersons: updatedProject!.referencePersons.map((ref) => ({
        id: ref.person.id,
        firstName: ref.person.firstName,
        lastName: ref.person.lastName,
        email: ref.person.email,
      })),
      analysts: updatedProject!.analysts.map((analyst) => ({
        id: analyst.person.id,
        firstName: analyst.person.firstName,
        lastName: analyst.person.lastName,
        email: analyst.person.email,
      })),
      developers: updatedProject!.developers.map((developer) => ({
        id: developer.person.id,
        firstName: developer.person.firstName,
        lastName: developer.person.lastName,
        email: developer.person.email,
        phone: developer.person.phone,
        status: developer.person.status.toLowerCase(),
      })),
      comments: updatedProject!.comments.map((comment) => ({
        id: comment.id,
        content: comment.content,
        author: comment.author,
        createdAt: comment.createdAt.toISOString(),
      })),
    };

    return NextResponse.json(transformedProject);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Erreur lors de la mise à jour du projet:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du projet" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;

    const existingProject = await prisma.project.findUnique({
      where: { id },
    });

    if (!existingProject) {
      return NextResponse.json({ error: "Projet non trouvé" }, { status: 404 });
    }

    const project = await prisma.project.update({
      where: { id },
      data: { deleted: true },
      include: {
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
          // Ajouter cette section partout
          include: {
            person: true,
          },
        },
        comments: {
          orderBy: {
            createdAt: "desc",
          },
        },
        owners: {
          include: {
            person: true,
          },
        },
      },
    });

    const transformedProject = {
      id: project.id,
      name: project.name,
      description: project.description,
      owners:
        project.owners?.map((owner) => ({
          id: owner.person.id,
          firstName: owner.person.firstName,
          lastName: owner.person.lastName,
          email: owner.person.email,
          phone: owner.person.phone,
          status: owner.person.status.toLowerCase(),
        })) || [],
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
        phone: developer.person.phone,
        status: developer.person.status.toLowerCase(),
      })),
      comments: project.comments.map((comment) => ({
        id: comment.id,
        content: comment.content,
        author: comment.author,
        createdAt: comment.createdAt.toISOString(),
      })),
    };

    return NextResponse.json(transformedProject);
  } catch (error) {
    console.error("Erreur lors de la suppression du projet:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du projet" },
      { status: 500 }
    );
  }
}
