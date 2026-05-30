/**
 * Client-side script to reset voucher expiry dates in localStorage
 * Run this in browser console to clear old cached vouchers
 *
 * Usage: Copy and paste entire content into browser console (F12 > Console tab)
 */

(function resetVouchersInLocalStorage() {
  const WALLET_KEY = "xfc-wallet-v2";
  const walletData = localStorage.getItem(WALLET_KEY);

  if (!walletData) {
    console.log("No wallet data found in localStorage");
    return;
  }

  try {
    const wallet = JSON.parse(walletData);
    const year = new Date().getFullYear();

    // June 1 to June 30
    const juneFirst = new Date(year, 5, 1, 0, 0, 0).toISOString();
    const juneThirtieth = new Date(year, 5, 30, 23, 59, 59).toISOString();

    let resetCount = 0;

    // Update all voucher items
    wallet.items = wallet.items.map((item) => {
      if (item.type === "voucher" && item.voucherExpiresAt) {
        console.log(
          `Resetting ${item.label}: old expiry ${item.voucherExpiresAt}`,
        );
        item.voucherExpiresAt = juneThirtieth;
        item.voucherUsableFrom = juneFirst;
        item.firstWonAt = juneFirst;
        resetCount++;
      }
      return item;
    });

    wallet.updatedAt = new Date().toISOString();
    localStorage.setItem(WALLET_KEY, JSON.stringify(wallet));

    console.log(`✅ Reset ${resetCount} vouchers successfully!`);
    console.log(`Valid from: ${juneFirst}`);
    console.log(`Valid until: ${juneThirtieth}`);
    console.log("Refresh the page to see the changes");
  } catch (error) {
    console.error("Error resetting vouchers:", error);
  }
})();
