import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { getFirebaseAdminDb } from "@/lib/firebase/admin";

export const runtime = "nodejs";
export const dynamic = "force-static";

/**
 * Admin endpoint: Reset all voucher expiry dates to 1/6 - 30/6
 * Regardless of when they were won. Spin period ends 15/6 (today).
 *
 * Usage: POST /api/admin/reset-vouchers?key=YOUR_SECRET_KEY
 */
export async function POST(request: NextRequest) {
  const authKey = request.nextUrl.searchParams.get("key");
  const adminKey = process.env.ADMIN_SECRET_KEY || "admin-secret-123";

  if (!authKey || authKey !== adminKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = getFirebaseAdminDb();

    // Fixed dates: June 1 to June 30
    const year = new Date().getFullYear();
    const juneFirstUsableFrom = new Date(year, 5, 1, 0, 0, 0).toISOString(); // June 1
    const juneThirtieth = new Date(year, 5, 30, 23, 59, 59, 999).toISOString(); // June 30

    // Get all vouchers
    const snapshot = await db
      .collection("spins")
      .where("reward_type", "==", "voucher")
      .get();

    let updated = 0;
    const batch = db.batch();

    snapshot.docs.forEach((doc) => {
      batch.update(doc.ref, {
        voucher_usable_from: juneFirstUsableFrom,
        created_at: new Date(year, 4, 31).toISOString(), // Set to May 31 so expiry = June 30
        updated_at: FieldValue.serverTimestamp(),
      });
      updated++;
    });

    await batch.commit();

    return NextResponse.json({
      success: true,
      message: `Reset ${updated} vouchers to 1/6 - 30/6`,
      updated,
      juneFirstUsableFrom,
      juneThirtieth,
    });
  } catch (error) {
    console.error("Reset vouchers error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

/**
 * GET endpoint for verification
 */
export async function GET(request: NextRequest) {
  const authKey = request.nextUrl.searchParams.get("key");
  const adminKey = process.env.ADMIN_SECRET_KEY || "admin-secret-123";

  if (!authKey || authKey !== adminKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = getFirebaseAdminDb();
    const snapshot = await db
      .collection("spins")
      .where("reward_type", "==", "voucher")
      .get();

    const vouchers = snapshot.docs.map((doc) => {
      const data = doc.data();
      const createdAt = new Date(data.created_at);
      const expiresAt = new Date(createdAt);
      expiresAt.setMonth(expiresAt.getMonth() + 1);

      return {
        id: doc.id,
        phone: data.phone,
        rewardLabel: data.reward_label,
        createdAt: data.created_at,
        voucherUsableFrom: data.voucher_usable_from,
        expiresAt: expiresAt.toISOString(),
        status: data.status,
      };
    });

    return NextResponse.json({
      total: vouchers.length,
      vouchers: vouchers.slice(0, 10), // Show first 10
    });
  } catch (error) {
    console.error("Get vouchers error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
