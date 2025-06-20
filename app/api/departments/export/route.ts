import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";

    const departments = await prisma.department.findMany({
      where: {
        deletedAt: null,
        ...(search && {
          nom: {
            contains: search,
            mode: "insensitive",
          },
        }),
      },
      orderBy: {
        nom: "asc",
      },
    });

    // Créer le workbook Excel
    const workbook = XLSX.utils.book_new();

    // Préparer les données pour Excel
    const excelData = departments.map((dept, index) => ({
      "N°": index + 1,
      ID: dept.id,
      "Nom du Département": dept.nom,
      Acronyme: dept.acronyme || "",
      "Date de Création": new Date(dept.createdAt).toLocaleDateString("fr-FR"),
      "Dernière Modification": new Date(dept.updatedAt).toLocaleDateString(
        "fr-FR"
      ),
    }));

    // Créer la feuille de calcul
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Ajouter la feuille au workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Départements");

    // Générer le buffer Excel
    const excelBuffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    // Retourner le fichier Excel
    return new NextResponse(excelBuffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="departements_${
          new Date().toISOString().split("T")[0]
        }.xlsx"`,
      },
    });
  } catch (error) {
    console.error("Error exporting departments:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'export des départements" },
      { status: 500 }
    );
  }
}
