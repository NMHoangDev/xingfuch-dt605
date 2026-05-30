# Hướng dẫn Deploy Voucher Reset (Tự động 1/6 - 30/6)

## 📱 Tính năng tự động

Sau khi deploy lên Vercel, **toàn bộ quá trình sẽ tự động**:

### 1️⃣ **Tự động clear cache trình duyệt** ✅

- `vercel.json` đã set `Cache-Control: max-age=3600` (1 giờ)
- Máy tính và **điện thoại sẽ cache mới** mỗi giờ
- User không cần làm gì

### 2️⃣ **Tự động reset localStorage** ✅

- File `lib/auto-reset-vouchers.ts` tự động chạy khi app load
- Kiểm tra `NEXT_PUBLIC_DEPLOYMENT_VERSION`
- Nếu version khác → **tự động reset toàn bộ voucher** → hạn 1/6 - 30/6
- User không cần làm gì, chỉ cần refresh/mở lại app

### 3️⃣ **Tự động reset Firebase** ✅ (Optional)

- `vercel-post-build.sh` chạy sau build
- Gọi API `/api/admin/reset-vouchers` tự động
- Đảm bảo cả server data cũng reset

---

## 🚀 Các bước deploy

### Step 1: Cập nhật file cần thiết

```bash
git add -A
git commit -m "fix: auto-reset vouchers to 1/6-30/6 and clear cache"
```

### Step 2: Set environment variables trên Vercel

Vào **Vercel Dashboard → Settings → Environment Variables**

Thêm 2 biến:

```
NEXT_PUBLIC_DEPLOYMENT_VERSION = 2026-05-30
ADMIN_SECRET_KEY = your-secret-key-123
```

⚠️ **Quan trọng**: `NEXT_PUBLIC_DEPLOYMENT_KEY` sẽ được gửi sang client (public), `ADMIN_SECRET_KEY` chỉ trên server (private)

### Step 3: Push code lên

```bash
git push origin main
```

Vercel sẽ **tự động**:

- ✅ Build app
- ✅ Chạy `vercel-post-build.sh` → reset Firebase
- ✅ Deploy lên production

### Step 4: Kiểm tra kết quả

**Trên Firebase Console:**

```
Firestore > spins > (chọn 1 document voucher)
Kiểm tra: created_at = 2026-05-31, voucher_usable_from = 2026-06-01
```

**Trên browser user (mọi device):**

- Refresh trang (F5)
- Mở DevTools (F12) → Console
- Sẽ thấy: `✅ Auto-reset X vouchers to 1/6 - 30/6`
- Hoặc nếu lần đầu: `ℹ️  No wallet data to reset`

---

## 🔄 Flow tự động

### Khi user mở app lần đầu sau deploy:

```
1. Page load
2. Auto-reset function chạy
3. Kiểm tra: DEPLOYMENT_VERSION thay đổi?
4. YES → Reset localStorage vouchers → hạn 1/6-30/6 ✅
5. NO → Không thay đổi (giữ nguyên)
6. App render với dữ liệu mới
```

### Khi user truy cập lần thứ hai:

```
1. Page load
2. Auto-reset function chạy
3. Kiểm tra: DEPLOYMENT_VERSION thay đổi?
4. NO → Bỏ qua, không reset
5. App render như bình thường
```

---

## 📊 Dữ liệu trước/sau

### Trước deploy:

```json
{
  "items": [
    {
      "id": 0,
      "label": "1 Topping",
      "type": "voucher",
      "voucherUsableFrom": "2026-05-20T15:00:00.000Z",
      "voucherExpiresAt": "2026-06-20T15:00:00.000Z" // ❌ Sai
    }
  ]
}
```

### Sau deploy:

```json
{
  "items": [
    {
      "id": 0,
      "label": "1 Topping",
      "type": "voucher",
      "voucherUsableFrom": "2026-06-01T00:00:00.000Z", // ✅ Fix
      "voucherExpiresAt": "2026-07-01T00:00:00.000Z" // ✅ Fix (= 30/6)
    }
  ]
}
```

---

## 🔐 Bảo mật

- `NEXT_PUBLIC_DEPLOYMENT_VERSION`: Public (client-side) ✅
- `ADMIN_SECRET_KEY`: Private (server-side only) ✅
- API endpoint `/api/admin/reset-vouchers` yêu cầu secret key
- Không ai có thể gọi API nếu không biết key

---

## 📱 Hỗ trợ điện thoại

✅ **Tất cả thiết bị hoạt động giống nhau:**

- Desktop browser → Auto-reset ✅
- Mobile (iPhone, Android) → Auto-reset ✅
- In-app browser → Auto-reset ✅
- Cache sẽ được update mỗi giờ

---

## ⚠️ Nếu có vấn đề

### Voucher chưa reset?

1. Refresh trang (F5)
2. Xóa browser cache (Ctrl+Shift+Del)
3. Chờ 1 giờ để cache expire
4. Kiểm tra console có message gì không (F12)

### Firebase chưa update?

1. Kiểm tra `ADMIN_SECRET_KEY` có đúng không
2. Check Vercel logs: Deployments > View Logs
3. Chạy POST request thủ công:
   ```bash
   curl -X POST "https://your-domain.vercel.app/api/admin/reset-vouchers?key=YOUR_KEY"
   ```

### Test locally:

```bash
NEXT_PUBLIC_DEPLOYMENT_VERSION=2026-05-30 npm run dev
# Vào browser console, check console logs
```

---

## 📝 Tóm tắt

| Thành phần         | Tự động? | Scope           | Cần action? |
| ------------------ | -------- | --------------- | ----------- |
| Cache clear        | ✅ Yes   | Browser (1 giờ) | No          |
| localStorage reset | ✅ Yes   | Client-side     | No          |
| Firebase reset     | ✅ Yes   | Server          | Set env key |
| User notification  | ❌ No    | Console log     | Optional    |

**Kết luận: Deploy 1 lần, tất cả tự xử lý!** 🚀
