import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
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

    if (existingPerson.status !== "DELETED") {
      return NextResponse.json(
        { error: "La personne n'est pas supprimée" },
        { status: 400 }
      );
    }

    const person = await prisma.person.update({
      where: { id },
      data: { status: "ACTIVE" },
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
    console.error("Erreur lors de la restauration de la personne:", error);
    return NextResponse.json(
      { error: "Erreur lors de la restauration de la personne" },
      { status: 500 }
    );
  }
}
