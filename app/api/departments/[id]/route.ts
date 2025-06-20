import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { nom, acronyme } = await request.json();
    const id = Number.parseInt(params.id);

    if (!nom || nom.trim() === "") {
      return NextResponse.json(
        { error: "Le nom du département est requis" },
        { status: 400 }
      );
    }

    const department = await prisma.department.update({
      where: { id },
      data: {
        nom: nom.trim(),
        acronyme: acronyme?.trim() || null,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(department);
  } catch (error) {
    console.error("Error updating department:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du département" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number.parseInt(params.id);

    // Soft delete
    const department = await prisma.department.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    return NextResponse.json(department);
  } catch (error) {
    console.error("Error deleting department:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du département" },
      { status: 500 }
    );
  }
}
