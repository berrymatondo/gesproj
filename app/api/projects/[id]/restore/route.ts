import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const existingProject = await prisma.project.findUnique({
      where: { id },
    });

    if (!existingProject) {
      return NextResponse.json({ error: "Projet non trouvé" }, { status: 404 });
    }

    if (!existingProject.deleted) {
      return NextResponse.json(
        { error: "Le projet n'est pas supprimé" },
        { status: 400 }
      );
    }

    const project = await prisma.project.update({
      where: { id },
      data: { deleted: false },
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
    console.error("Erreur lors de la restauration du projet:", error);
    return NextResponse.json(
      { error: "Erreur lors de la restauration du projet" },
      { status: 500 }
    );
  }
}
