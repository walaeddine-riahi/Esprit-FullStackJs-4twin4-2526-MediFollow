/**
 * Script pour mettre à jour les enregistrements de signes vitaux existants
 * Ajoute le statut NORMAL aux anciennes données qui n'en ont pas
 */

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function updateVitalRecords() {
  try {
    console.log("🔄 Mise à jour des enregistrements de signes vitaux...");

    // Récupérer tous les enregistrements
    const allRecords = await prisma.vitalRecord.findMany({
      select: {
        id: true,
        status: true,
      },
    });

    console.log(`📊 Total: ${allRecords.length} enregistrements`);

    // Filtrer ceux sans statut
    const recordsToUpdate = allRecords.filter(
      (record) => !record.status || record.status === ""
    );

    console.log(`📊 Trouvé ${recordsToUpdate.length} enregistrements à mettre à jour`);

    if (recordsToUpdate.length === 0) {
      console.log("✅ Tous les enregistrements ont déjà un statut !");
      return;
    }

    // Mettre à jour chaque enregistrement individuellement
    let updated = 0;
    for (const record of recordsToUpdate) {
      await prisma.vitalRecord.update({
        where: { id: record.id },
        data: { status: "NORMAL" },
      });
      updated++;
    }

    console.log(`✅ ${updated} enregistrements mis à jour avec succès !`);
    console.log("   Statut par défaut: NORMAL");
    console.log("\n📝 Note: Les nouveaux enregistrements auront leur statut calculé automatiquement.");
  } catch (error) {
    console.error("❌ Erreur lors de la mise à jour:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

updateVitalRecords();
