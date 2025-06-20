import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const createDepartmentSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  shortName: z.string().min(1, "Le nom court est requis"),
})

const querySchema = z.object({
  search: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "DELETED", "all"]).optional(),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const { search, status } = querySchema.parse({
      search: searchParams.get("search") || undefined,
      status: searchParams.get("status") || undefined,
    })

    const where: any = {}

    if (search) {
      where.name = {
        contains: search,
        mode: "insensitive",
      }
    }

    if (status && status !== "all") {
      where.status = status
    }

    const departments = await prisma.department.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    })

    const transformedDepartments = departments.map((dept) => ({
      id: dept.id,
      name: dept.name,
      shortName: dept.shortName,
      status: dept.status.toLowerCase(),
      createdAt: dept.createdAt.toISOString(),
      updatedAt: dept.updatedAt.toISOString(),
    }))

    return NextResponse.json(transformedDepartments)
  } catch (error) {
    console.error("Erreur lors de la récupération des départements:", error)
    return NextResponse.json({ error: "Erreur lors de la récupération des départements" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, shortName } = createDepartmentSchema.parse(body)

    const department = await prisma.department.create({
      data: {
        name,
        shortName,
        status: "ACTIVE",
      },
    })

    const transformedDepartment = {
      id: department.id,
      name: department.name,
      shortName: department.shortName,
      status: department.status.toLowerCase(),
      createdAt: department.createdAt.toISOString(),
      updatedAt: department.updatedAt.toISOString(),
    }

    return NextResponse.json(transformedDepartment, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Données invalides", details: error.errors }, { status: 400 })
    }

    console.error("Erreur lors de la création du département:", error)
    return NextResponse.json({ error: "Erreur lors de la création du département" }, { status: 500 })
  }
}
