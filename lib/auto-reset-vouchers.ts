/**
 * Auto-reset vouchers on app load if version changed
 * Runs automatically on client side, no user action needed
 */

type WalletItem = {
  type: string;
  voucherExpiresAt?: string;
  voucherUsableFrom?: string;
  firstWonAt?: string;
  [key: string]: any;
};

type Wallet = {
  items: WalletItem[];
  updatedAt: string;
};

const APP_VERSION_KEY = "xfc-app-version";
const WALLET_KEY = "xfc-wallet-v2";
/** Ngày 15/06/2026 là ngày quay cuối cùng; bump version để kích hoạt reset. */
const DEPLOYMENT_VERSION =
  process.env.NEXT_PUBLIC_DEPLOYMENT_VERSION || "2026-06-15-v1";

export function initializeAutoReset() {
  if (typeof window === "undefined") return;

  const currentVersion = localStorage.getItem(APP_VERSION_KEY);

  // If version changed or first visit, reset vouchers
  if (currentVersion !== DEPLOYMENT_VERSION) {
    console.log(
      `🔄 Version update detected: ${currentVersion} → ${DEPLOYMENT_VERSION}`,
    );
    resetVouchersInLocalStorage();
    localStorage.setItem(APP_VERSION_KEY, DEPLOYMENT_VERSION);
  }
}

function resetVouchersInLocalStorage() {
  const walletData = localStorage.getItem(WALLET_KEY);

  if (!walletData) {
    console.log("ℹ️  No wallet data to reset");
    return;
  }

  try {
    const wallet: Wallet = JSON.parse(walletData);
    const year = new Date().getFullYear();

    // Spin period: 1/6 - 15/6 (last spin day = 15/6 today)
    // Voucher validity: 1/6 - 30/6 (last day to USE voucher = 30/6)
    const juneFirst = new Date(year, 5, 1, 0, 0, 0).toISOString();
    const juneThirtieth = new Date(year, 5, 30, 23, 59, 59, 999).toISOString();

    let resetCount = 0;

    wallet.items = (wallet.items || []).map((item: WalletItem) => {
      if (item.type === "voucher") {
        item.voucherExpiresAt = juneThirtieth;
        item.voucherUsableFrom = juneFirst;
        item.firstWonAt = juneFirst;
        resetCount++;
      }
      return item;
    });

    wallet.updatedAt = new Date().toISOString();
    localStorage.setItem(WALLET_KEY, JSON.stringify(wallet));

    console.log(`✅ Auto-reset ${resetCount} vouchers to 1/6 - 30/6`);
  } catch (error) {
    console.error("❌ Auto-reset error:", error);
  }
}
