/**
 * Script de migration pour ajouter le reviewStatus aux enregistrements existants
 */

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("🔄 Migration: Ajout du reviewStatus aux enregistrements de signes vitaux...");

  try {
    // Compter les enregistrements actuels
    const totalBefore = await prisma.vitalRecord.count();
    console.log(`📊 Total d'enregistrements: ${totalBefore}`);

    // Trouver tous les enregistrements
    const allRecords = await prisma.$runCommandRaw({
      find: "vital_records",
      filter: {},
    });

    console.log(`📝 Documents trouvés: ${allRecords.cursor.firstBatch.length}`);

    // Mettre à jour tous les enregistrements pour ajouter reviewStatus
    const updateResult = await prisma.$runCommandRaw({
      update: "vital_records",
      updates: [
        {
          q: { reviewStatus: { $exists: false } },
          u: { $set: { reviewStatus: "PENDING" } },
          multi: true,
        },
      ],
    });

    console.log(`✅ Mis à jour ${updateResult.n} enregistrements`);

    // Afficher les statistiques
    const pending = await prisma.vitalRecord.count({
      where: { reviewStatus: "PENDING" },
    });

    const reviewed = await prisma.vitalRecord.count({
      where: { reviewStatus: "REVIEWED" },
    });

    console.log(`\n📊 Statistiques après migration:`);
    console.log(`   - En attente de review: ${pending}`);
    console.log(`   - Reviewés: ${reviewed}`);
    console.log(`   - Total: ${pending + reviewed}`);

    console.log(`\n✅ Migration terminée avec succès!`);

  } catch (error) {
    console.error("❌ Erreur lors de la migration:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
