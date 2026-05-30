# Hướng dẫn Reset Hạn Sử Dụng Voucher (1/6 - 30/6)

## Bối cảnh

- Một số user đã quay voucher trước ngày 1/6 và hạn sử dụng được set tự động là từ ngày quay tới 30/6
- Cần reset toàn bộ voucher để tất cả, dù quay lúc nào, đều có hạn sử dụng **1/6 - 30/6**

## Cách sử dụng

### Option 1: Reset trên Server (Firebase) - Khuyến nghị

**Yêu cầu:** Đặt biến môi trường `ADMIN_SECRET_KEY`

1. **Thêm vào `.env.local`:**

   ```
   ADMIN_SECRET_KEY=your-secret-key-here
   ```

2. **Gọi API từ terminal hoặc Postman:**

   ```bash
   # Reset (POST)
   curl -X POST "http://localhost:3000/api/admin/reset-vouchers?key=your-secret-key-here"

   # Verify (GET)
   curl -X GET "http://localhost:3000/api/admin/reset-vouchers?key=your-secret-key-here"
   ```

3. **Response thành công:**
   ```json
   {
     "success": true,
     "message": "Reset 42 vouchers to 1/6 - 30/6",
     "updated": 42,
     "juneFirstUsableFrom": "2026-06-01T00:00:00.000Z",
     "juneThirtieth": "2026-07-01T00:00:00.000Z"
   }
   ```

### Option 2: Reset trên Client (localStorage)

Để clear dữ liệu cũ trên máy user:

1. Mở trang web trên browser của user
2. Nhấn **F12** để mở Dev Tools
3. Chọn tab **Console**
4. Copy toàn bộ nội dung từ `scripts/reset-vouchers.js` và paste vào Console
5. Nhấn Enter
6. Refresh trang (F5)

Output mong đợi:

```
✅ Reset 5 vouchers successfully!
Valid from: 2026-06-01T00:00:00.000Z
Valid until: 2026-06-30T23:59:59.000Z
Refresh the page to see the changes
```

### Option 3: Đặt task tự động chạy

Thêm vào `package.json`:

```json
{
  "scripts": {
    "admin:reset-vouchers": "node scripts/reset-vouchers-cli.js"
  }
}
```

Sau đó chạy:

```bash
ADMIN_SECRET_KEY=your-secret-key npm run admin:reset-vouchers
```

## Các thay đổi đã làm

### 1. **vercel.json** - Clear Cache

- Thay đổi `Cache-Control` headers từ `max-age=31536000` (1 năm) thành `max-age=3600` (1 giờ)
- Thêm cache-busting rule cho tất cả trang
- Đảm bảo user luôn nhận bản mới nhất

### 2. **API Endpoint** - `/api/admin/reset-vouchers`

- **POST**: Reset tất cả voucher có hạn sử dụng = 1/6 - 30/6
- **GET**: Xem danh sách voucher hiện tại
- Yêu cầu `ADMIN_SECRET_KEY` để bảo mật

### 3. **Script Client** - `scripts/reset-vouchers.js`

- Chạy trực tiếp từ browser console
- Reset localStorage của user
- Không cần server-side access

## Flow khi deploy

1. ✅ Deploy code (vercel.json + API endpoint)
2. ✅ Gọi API reset trên server (nếu có Firebase)
3. ✅ Hướng dẫn user chạy script nếu cần clear localStorage
4. ✅ User refresh browser để lấy dữ liệu mới

## Kiểm tra

**Trên Firebase Console:**

- Vào **Firestore > spins** collection
- Xem các document có `reward_type = "voucher"`
- Kiểm tra `created_at` và `voucher_usable_from` có bằng `2026-05-31` hoặc `2026-06-01` không

**Trên Client:**

- F12 > Storage > Local Storage
- Key: `xfc-wallet-v2`
- Kiểm tra `voucherExpiresAt` có là `2026-06-30` không

## Lưu ý

- **Timezone**: Sử dụng ISO 8601 format (UTC)
- **June 30**: Sử dụng `2026-07-01T00:00:00Z` (nghĩa là hết hạn vào đầu ngày 1/7)
- **Env variable**: Không commit `ADMIN_SECRET_KEY` lên git, dùng `.env.local`
