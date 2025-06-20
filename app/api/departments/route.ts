import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";

    const departments = await prisma.department.findMany({
      where: {
        deletedAt: null,
        ...(search && {
          OR: [
            {
              nom: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              acronyme: {
                contains: search,
                mode: "insensitive",
              },
            },
          ],
        }),
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(departments);
  } catch (error) {
    console.error("Error fetching departments:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des départements" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { nom, acronyme } = await request.json();

    if (!nom || nom.trim() === "") {
      return NextResponse.json(
        { error: "Le nom du département est requis" },
        { status: 400 }
      );
    }

    const department = await prisma.department.create({
      data: {
        nom: nom.trim(),
        acronyme: acronyme?.trim() || null,
      },
    });

    return NextResponse.json(department, { status: 201 });
  } catch (error) {
    console.error("Error creating department:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du département" },
      { status: 500 }
    );
  }
}
