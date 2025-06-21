import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const createPersonSchema = z.object({
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName: z.string().min(1, "Le nom est requis"),
  email: z.string().email("Email invalide"),
  phone: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "DELETED"]).optional().default("ACTIVE"),
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
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ]
    }

    if (status && status !== "all") {
      where.status = status
    }

    const persons = await prisma.person.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    })

    const transformedPersons = persons.map((person) => ({
      id: person.id,
      firstName: person.firstName,
      lastName: person.lastName,
      email: person.email,
      phone: person.phone,
      status: person.status.toLowerCase(),
      createdAt: person.createdAt.toISOString(),
      updatedAt: person.updatedAt.toISOString(),
    }))

    return NextResponse.json(transformedPersons)
  } catch (error) {
    console.error("Erreur lors de la récupération des personnes:", error)
    return NextResponse.json({ error: "Erreur lors de la récupération des personnes" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, phone, status } = createPersonSchema.parse(body)

    // Vérifier si l'email existe déjà
    const existingPerson = await prisma.person.findUnique({
      where: { email },
    })

    if (existingPerson) {
      return NextResponse.json({ error: "Cette adresse email est déjà utilisée" }, { status: 400 })
    }

    const person = await prisma.person.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        status: status || "ACTIVE",
      },
    })

    const transformedPerson = {
      id: person.id,
      firstName: person.firstName,
      lastName: person.lastName,
      email: person.email,
      phone: person.phone,
      status: person.status.toLowerCase(),
      createdAt: person.createdAt.toISOString(),
      updatedAt: person.updatedAt.toISOString(),
    }

    return NextResponse.json(transformedPerson, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Données invalides", details: error.errors }, { status: 400 })
    }

    console.error("Erreur lors de la création de la personne:", error)
    return NextResponse.json({ error: "Erreur lors de la création de la personne" }, { status: 500 })
  }
}
