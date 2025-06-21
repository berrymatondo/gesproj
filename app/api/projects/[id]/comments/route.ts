import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createCommentSchema = z.object({
  content: z.string().min(1, "Le contenu du commentaire est requis"),
  author: z.string().min(1, "L'auteur est requis"),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: projectId } = params;
    const body = await request.json();
    const { content, author } = createCommentSchema.parse(body);

    // Vérifier que le projet existe
    const existingProject = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!existingProject) {
      return NextResponse.json({ error: "Projet non trouvé" }, { status: 404 });
    }

    const comment = await prisma.projectComment.create({
      data: {
        projectId,
        content,
        author,
      },
    });

    const transformedComment = {
      id: comment.id,
      content: comment.content,
      author: comment.author,
      createdAt: comment.createdAt.toISOString(),
    };

    return NextResponse.json(transformedComment, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Données invalides", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Erreur lors de la création du commentaire:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du commentaire" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: projectId } = params;

    const comments = await prisma.projectComment.findMany({
      where: { projectId },
      orderBy: {
        createdAt: "desc",
      },
    });

    const transformedComments = comments.map((comment) => ({
      id: comment.id,
      content: comment.content,
      author: comment.author,
      createdAt: comment.createdAt.toISOString(),
    }));

    return NextResponse.json(transformedComments);
  } catch (error) {
    console.error("Erreur lors de la récupération des commentaires:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des commentaires" },
      { status: 500 }
    );
  }
}
