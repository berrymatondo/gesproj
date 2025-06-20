import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateDepartmentSchema = z.object({
  name: z.string().min(1, "Le nom est requis").optional(),
  shortName: z.string().min(1, "Le nom court est requis").optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "DELETED"]).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const department = await prisma.department.findUnique({
      where: { id },
    });

    if (!department) {
      return NextResponse.json(
        { error: "Département non trouvé" },
        { status: 404 }
      );
    }

    const transformedDepartment = {
      id: department.id,
      name: department.name,
      shortName: department.shortName,
      status: department.status.toLowerCase(),
      createdAt: department.createdAt.toISOString(),
      updatedAt: department.updatedAt.toISOString(),
    };

    return NextResponse.json(transformedDepartment);
  } catch (error) {
    console.error("Erreur lors de la récupération du département:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du département" },
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
    const updateData = updateDepartmentSchema.parse(body);

    const existingDepartment = await prisma.department.findUnique({
      where: { id },
    });

    if (!existingDepartment) {
      return NextResponse.json(
        { error: "Département non trouvé" },
        { status: 404 }
      );
    }

    // Construire l'objet de mise à jour
    const dataToUpdate: any = {};
    if (updateData.name !== undefined) dataToUpdate.name = updateData.name;
    if (updateData.shortName !== undefined)
      dataToUpdate.shortName = updateData.shortName;
    if (updateData.status !== undefined)
      dataToUpdate.status = updateData.status;

    const department = await prisma.department.update({
      where: { id },
      data: dataToUpdate,
    });

    const transformedDepartment = {
      id: department.id,
      name: department.name,
      shortName: department.shortName,
      status: department.status.toLowerCase(),
      createdAt: department.createdAt.toISOString(),
      updatedAt: department.updatedAt.toISOString(),
    };

    return NextResponse.json(transformedDepartment);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Erreur lors de la mise à jour du département:", error);
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
    const { id } = params;

    const existingDepartment = await prisma.department.findUnique({
      where: { id },
    });

    if (!existingDepartment) {
      return NextResponse.json(
        { error: "Département non trouvé" },
        { status: 404 }
      );
    }

    const department = await prisma.department.update({
      where: { id },
      data: { status: "DELETED" },
    });

    const transformedDepartment = {
      id: department.id,
      name: department.name,
      shortName: department.shortName,
      status: department.status.toLowerCase(),
      createdAt: department.createdAt.toISOString(),
      updatedAt: department.updatedAt.toISOString(),
    };

    return NextResponse.json(transformedDepartment);
  } catch (error) {
    console.error("Erreur lors de la suppression du département:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du département" },
      { status: 500 }
    );
  }
}
