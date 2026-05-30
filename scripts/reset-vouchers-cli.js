#!/usr/bin/env node

/**
 * CLI script to reset voucher expiry dates in Firebase
 * Run: node scripts/reset-vouchers-cli.js
 *
 * Requires:
 * - ADMIN_SECRET_KEY env variable (for safety)
 * - Firebase admin SDK initialized
 */

import admin from "firebase-admin";
import * as fs from "fs";
import * as path from "path";

// Load Firebase credentials
const credentialsPath = path.join(
  process.cwd(),
  "hp-task-firebase-adminsdk-fbsvc-ee802f04c3.json",
);

if (!fs.existsSync(credentialsPath)) {
  console.error("❌ Firebase credentials file not found:", credentialsPath);
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(credentialsPath, "utf-8"));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

async function resetVouchers() {
  const year = new Date().getFullYear();
  const juneFirstUsableFrom = new Date(year, 5, 1, 0, 0, 0).toISOString(); // June 1
  const juneThirtieth = new Date(year, 6, 1, 0, 0, 0).toISOString(); // July 1

  console.log("🔄 Fetching all vouchers from Firebase...");

  const snapshot = await db
    .collection("spins")
    .where("reward_type", "==", "voucher")
    .get();

  console.log(`📋 Found ${snapshot.size} vouchers`);

  if (snapshot.empty) {
    console.log("✅ No vouchers to update");
    process.exit(0);
  }

  const batch = db.batch();
  let updated = 0;

  console.log("\n🔧 Updating vouchers...");

  snapshot.docs.forEach((doc) => {
    const data = doc.data();
    console.log(
      `  • ${data.phone} - ${data.reward_label} (created: ${data.created_at})`,
    );

    batch.update(doc.ref, {
      voucher_usable_from: juneFirstUsableFrom,
      created_at: new Date(year, 4, 31).toISOString(), // Set to May 31
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    updated++;
  });

  try {
    console.log(`\n✍️  Committing batch update (${updated} documents)...`);
    await batch.commit();

    console.log("\n✅ Success!");
    console.log(`   Total updated: ${updated} vouchers`);
    console.log(`   Valid from: ${juneFirstUsableFrom}`);
    console.log(`   Expires at: ${juneThirtieth}`);
    console.log("\n🎉 All vouchers now have validity period: 1/6 - 30/6");
  } catch (error) {
    console.error("\n❌ Error updating vouchers:", error);
    process.exit(1);
  }

  await admin.app().delete();
}

// Main execution
resetVouchers().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
