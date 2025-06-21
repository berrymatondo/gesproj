import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updatePersonSchema = z.object({
  firstName: z.string().min(1, "Le prénom est requis").optional(),
  lastName: z.string().min(1, "Le nom est requis").optional(),
  email: z.string().email("Email invalide").optional(),
  phone: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "DELETED"]).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const person = await prisma.person.findUnique({
      where: { id },
    });

    if (!person) {
      return NextResponse.json(
        { error: "Personne non trouvée" },
        { status: 404 }
      );
    }

    const transformedPerson = {
      id: person.id,
      firstName: person.firstName,
      lastName: person.lastName,
      email: person.email,
      phone: person.phone,
      status: person.status.toLowerCase(),
      createdAt: person.createdAt.toISOString(),
      updatedAt: person.updatedAt.toISOString(),
    };

    return NextResponse.json(transformedPerson);
  } catch (error) {
    console.error("Erreur lors de la récupération de la personne:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de la personne" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const updateData = updatePersonSchema.parse(body);

    const existingPerson = await prisma.person.findUnique({
      where: { id },
    });

    if (!existingPerson) {
      return NextResponse.json(
        { error: "Personne non trouvée" },
        { status: 404 }
      );
    }

    // Vérifier si l'email existe déjà (sauf pour la personne actuelle)
    if (updateData.email && updateData.email !== existingPerson.email) {
      const emailExists = await prisma.person.findUnique({
        where: { email: updateData.email },
      });

      if (emailExists) {
        return NextResponse.json(
          { error: "Cette adresse email est déjà utilisée" },
          { status: 400 }
        );
      }
    }

    const dataToUpdate: any = {};
    if (updateData.firstName !== undefined)
      dataToUpdate.firstName = updateData.firstName;
    if (updateData.lastName !== undefined)
      dataToUpdate.lastName = updateData.lastName;
    if (updateData.email !== undefined) dataToUpdate.email = updateData.email;
    if (updateData.phone !== undefined) dataToUpdate.phone = updateData.phone;
    if (updateData.status !== undefined)
      dataToUpdate.status = updateData.status;

    const person = await prisma.person.update({
      where: { id },
      data: dataToUpdate,
    });

    const transformedPerson = {
      id: person.id,
      firstName: person.firstName,
      lastName: person.lastName,
      email: person.email,
      phone: person.phone,
      status: person.status.toLowerCase(),
      createdAt: person.createdAt.toISOString(),
      updatedAt: person.updatedAt.toISOString(),
    };

    return NextResponse.json(transformedPerson);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Erreur lors de la mise à jour de la personne:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de la personne" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const existingPerson = await prisma.person.findUnique({
      where: { id },
    });

    if (!existingPerson) {
      return NextResponse.json(
        { error: "Personne non trouvée" },
        { status: 404 }
      );
    }

    const person = await prisma.person.update({
      where: { id },
      data: { status: "DELETED" },
    });

    const transformedPerson = {
      id: person.id,
      firstName: person.firstName,
      lastName: person.lastName,
      email: person.email,
      phone: person.phone,
      status: person.status.toLowerCase(),
      createdAt: person.createdAt.toISOString(),
      updatedAt: person.updatedAt.toISOString(),
    };

    return NextResponse.json(transformedPerson);
  } catch (error) {
    console.error("Erreur lors de la suppression de la personne:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de la personne" },
      { status: 500 }
    );
  }
}
