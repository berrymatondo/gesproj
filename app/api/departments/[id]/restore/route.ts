import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    const existingDepartment = await prisma.department.findUnique({
      where: { id },
    })

    if (!existingDepartment) {
      return NextResponse.json({ error: "Département non trouvé" }, { status: 404 })
    }

    if (existingDepartment.status !== "DELETED") {
      return NextResponse.json({ error: "Le département n'est pas supprimé" }, { status: 400 })
    }

    const department = await prisma.department.update({
      where: { id },
      data: { status: "ACTIVE" },
    })

    const transformedDepartment = {
      id: department.id,
      name: department.name,
      shortName: department.shortName,
      status: department.status.toLowerCase(),
      createdAt: department.createdAt.toISOString(),
      updatedAt: department.updatedAt.toISOString(),
    }

    return NextResponse.json(transformedDepartment)
  } catch (error) {
    console.error("Erreur lors de la restauration du département:", error)
    return NextResponse.json({ error: "Erreur lors de la restauration du département" }, { status: 500 })
  }
}
