# ✅ DEPLOYMENT CHECKLIST - Voucher Reset Tự động (1/6 - 30/6)

## 🎯 Mục tiêu

- ✅ Clear cache toàn bộ (desktop & mobile)
- ✅ Reset hạn voucher → 1/6 - 30/6 tự động (dù quay ngày nào cũng ra hạn này)
- ✅ Hạn cuối vòng quay: **15/06/2026** (hôm nay)
- ✅ Hạn cuối dùng voucher: **30/06/2026**
- ✅ Không cần user làm gì

---

## 📋 Danh sách công việc

### ✅ Bước 1: Chuẩn bị code (DONE)

```
✓ lib/auto-reset-vouchers.ts - Auto-reset function
✓ app/PageContent.tsx - Import & gọi auto-reset
✓ app/api/admin/reset-vouchers/route.ts - API endpoint
✓ vercel.json - Cache headers + post-build hook
✓ vercel-post-build.sh - Deployment script
✓ .env.example - Environment variables
✓ docs/DEPLOYMENT_AUTO_RESET.md - Documentation
```

### ⏳ Bước 2: Git commit

```bash
git add -A
git commit -m "fix: auto-reset vouchers to 1/6-30/6 and clear browser cache"
git push origin main
```

### ⏳ Bước 3: Vercel setup

Vào **https://vercel.com/dashboard**

**Settings → Environment Variables** → Thêm 2 biến:

| Key                              | Value                  | Scope                            |
| -------------------------------- | ---------------------- | -------------------------------- |
| `NEXT_PUBLIC_DEPLOYMENT_VERSION` | `2026-06-15`           | Production, Preview, Development |
| `ADMIN_SECRET_KEY`               | `your-secret-key-here` | Production                       |

### ⏳ Bước 4: Deploy

```bash
git push origin main
# Vercel tự động deploy
```

### ⏳ Bước 5: Verify

**Check Vercel logs:**

- Deployments → Select latest → View Logs
- Kiểm trace: `Post-deployment: Resetting vouchers...`

**Check Firebase:**

- Firestore → `spins` collection
- Chọn 1 voucher → Check `created_at = 2026-05-31`

**Check Client (user):**

- Mở app trên browser
- F12 → Console
- Xem có: `✅ Auto-reset X vouchers to 1/6 - 30/6`

---

## 🔑 Environment Variables Cần Thiết

### `NEXT_PUBLIC_DEPLOYMENT_VERSION`

- **Mục đích**: Trigger auto-reset nếu version thay đổi
- **Giá trị**: `2026-05-30` (hoặc ngày deploy)
- **Scope**: Public (gửi sang client)
- **Thay đổi**: Mỗi lần muốn reset, đổi giá trị này

### `ADMIN_SECRET_KEY`

- **Mục đích**: Bảo vệ API `/api/admin/reset-vouchers`
- **Giá trị**: `your-secret-key-here` (set bất cứ gì)
- **Scope**: Private (server-only)
- **Không commit**: Đừng push lên git

---

## 🔄 Cách hoạt động

```
User mở app sau deploy
          ↓
initializeAutoReset() chạy
          ↓
Kiểm tra: Version thay đổi?
        ↙        ↘
      YES        NO
       ↓          ↓
   Reset      Bỏ qua
 localStorage  (giữ nguyên)
       ↓          ↓
     Hạn → 1/6-30/6
       ↓
   App render
```

---

## 📊 Kết quả mong đợi

### 1. Cache clear ✅

```
Browser:
- Images: 1 hour cache → force revalidate
- Assets: 1 hour cache → force revalidate
- API: no-store → always fresh
```

### 2. localStorage reset ✅

```javascript
// Before deploy
voucherExpiresAt: "2026-05-25T10:00:00.000Z"; // ❌ Wrong

// After deploy (auto on page load)
voucherExpiresAt: "2026-07-01T00:00:00.000Z"; // ✅ Correct (= June 30)
voucherUsableFrom: "2026-06-01T00:00:00.000Z"; // ✅ Correct
```

### 3. Firebase reset ✅

```
POST /api/admin/reset-vouchers?key=xxx
Response:
{
  "success": true,
  "updated": 42,
  "message": "Reset 42 vouchers to 1/6 - 30/6"
}
```

---

## 🧪 Testing (Local)

```bash
# 1. Set env
export NEXT_PUBLIC_DEPLOYMENT_VERSION=2026-06-15

# 2. Run dev
npm run dev

# 3. Open browser
open http://localhost:3000

# 4. Check console
F12 → Console → Look for:
✅ Auto-reset X vouchers to 1/6 - 30/6
```

---

## 🆘 Troubleshooting

| Problem              | Solution                                     |
| -------------------- | -------------------------------------------- |
| Voucher chưa reset   | Refresh browser (F5) hoặc xóa cache          |
| Firebase chưa update | Check `ADMIN_SECRET_KEY` hoặc logs           |
| Console error        | Check network tab → API response             |
| Cache chưa clear     | Chờ 1 giờ hoặc manual clear (Ctrl+Shift+Del) |

---

## 📱 Mobile users

- ✅ Tất cả điện thoại (iPhone, Android) đều tự động
- ✅ In-app browser cũng hoạt động
- ✅ Không cần download lại app
- ✅ Chỉ cần refresh lại browser

---

## ✨ Summary

**Deploy lên Vercel → Tất cả tự động reset! Người dùng không cần làm gì.** 🚀
