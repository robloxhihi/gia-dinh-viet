# Gia Đình Việt

Trang giới thiệu và tải bản cài đặt cho ứng dụng Android **Gia Đình Việt** — sản phẩm dự thi khoa học kĩ thuật.

App dành cho gia đình: phụ huynh và học sinh ghép tài khoản với nhau, xem vị trí của nhau, xem thời gian dùng máy, nhắn tin trong gia đình, và có nút SOS gửi cảnh báo kèm tọa độ.

> Bản đang phát hành là **demo**. Chưa có trên CH Play. APK ký bằng debug key.

---

## Cấu trúc thư mục

```
giadinhviet-web/
  index.html
  assets/
    css/style.css
    js/main.js          <- file duy nhất cần sửa khi đăng tải
    img/hero-bg.png
  apk/                  <- de test local, KHONG len git (.gitignore)
  docs/screenshots/
```

Mã nguồn app nằm ở thư mục `GIaDinhViet_APP/`, không nằm trong repo này.

---

## Chạy thử trên máy

```bash
cd giadinhviet-web
python -m http.server 8000
```

Mở `http://127.0.0.1:8000`.

Copy file APK vào `apk/GiaDinhViet-v2.apk` thì nút tải chạy được ngay.

---

## Đăng tải lên GitHub

File APK **không** commit vào repo (79 MB, và git sẽ giữ nó mãi mãi). Đưa lên Releases:

1. Tạo repo public, push thư mục này.
2. **Releases → Draft a new release → tag `v2` → Upload binary** → chọn file APK.
3. Mở `assets/js/main.js`, điền 3 ô trong `CONFIG`:

```js
githubRepo:    "robloxhihi/giadinhviet",
releaseTag:    "v2",
apkFileName:   "GiaDinhViet-v2.apk",
```

4. Vào **Settings → Pages → Branch: main / folder: /(root)** → trang live.

Xong. Nút tải trên trang sẽ trỏ thẳng vào file trong Release.

---

## Đặt tên file APK

Đừng dùng tên game hay tên linh tinh. Người dùng thấy `GarenaTiMi.apk` khi cài một app mang tên Gia Đình Việt thì họ có quyền nghi ngờ.

Tên chuẩn: `GiaDinhViet-v2.apk`. Trùng với tên app, trùng với tag Release.

---

## Quyền ứng dụng

Bản v2 xin 31 quyền. Android liệt kê hết trên màn hình cài đặt, nên ghi rõ ở đây:

| Nhóm | Quyền | Dùng để làm gì |
|---|---|---|
| Vị trí | `ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION`, `ACCESS_BACKGROUND_LOCATION`, `FOREGROUND_SERVICE_LOCATION` | Định vị lúc app đã đóng |
| Tin nhắn / cuộc gọi | `SEND_SMS`, `READ_SMS`, `RECEIVE_SMS`, `CALL_PHONE` | SOS gửi tin nhắn kèm tọa độ khi không có Internet; màn hình gọi khẩn cấp |
| Camera / micro | `CAMERA`, `RECORD_AUDIO` | Gọi khẩn cấp |
| Thống kê | `PACKAGE_USAGE_STATS` | Đọc thời gian dùng app khác (cấp thủ công) |
| Kết nối | `BLUETOOTH_SCAN`, `NEARBY_WIFI_DEVICES`, `ACCESS_WIFI_STATE` | SOS Mesh |
| Khác | `POST_NOTIFICATIONS`, `FOREGROUND_SERVICE`, `SYSTEM_ALERT_WINDOW`, `VIBRATE`, `INTERNET` | Thông báo, service nền, nút SOS nổi |

Nhóm camera và micro là điểm chưa hợp lý: tính năng gọi khẩn cấp chưa hoàn thiện nhưng quyền đã xin từ lúc cài. Bản sau sẽ tách sang runtime request.

---

## App chưa làm được

- **Không chặn được ứng dụng khác.** Chỉ đọc thời gian sử dụng rồi nhắc. Chặn thật cần Device Admin hoặc Accessibility Service.
- **Không hoạt động khi chưa đăng nhập.** Cần tài khoản Firebase.
- **Chưa có trên CH Play.**

---

## Bảo mật dữ liệu

Dữ liệu nằm trên Cloud Firestore. Quy tắc truy cập: `app/applet/firestore.rules` trong mã nguồn.

Mình đã đọc file rules của bản v2 và của bản cũ. Cả hai đều đang mở:

```
match /locations/{userId}          { allow read, write: if isAuthenticated(); }
match /location_history/{docId}    { allow read, write: if isAuthenticated(); }
match /sos_alerts/{alertId}        { allow read, write: if isAuthenticated(); }
match /pairings/{pairingId}        { allow read, write, create, update, delete: if isAuthenticated(); }
```

`isAuthenticated()` = **bất kỳ tài khoản nào đăng nhập thành công**, không kiểm tra hai người có thuộc cùng một gia đình không.

Nghĩa là chỉ cần đăng ký một tài khoản, người ta đọc được vị trí của mọi người dùng, và **ghi đè được luôn**. Bản v2 còn mở rộng hơn bản cũ: thêm `location_history` và `sos_alerts`, và cho cả `write` vào `locations`.

Hàm `isOwner(userId)` có định nghĩa sẵn ở đầu file nhưng không được dùng cho lệnh đọc nào.

**Mình chưa sửa gì cả.** Đây là việc còn dở, không phải việc đã xong:

1. Viết lại rules: cho phép đọc/ghi chỉ khi `request.auth.uid` là thành viên cùng pairing với `userId`.
2. Deploy lên project Firebase.
3. Build lại APK từ `GIaDinhViet_APP`.
4. Thay file trong Release.

Chừng nào chưa làm 4 bước đó, đừng đưa link cho ai ngoài máy của bạn.

---

## Công nghệ

Kotlin · Jetpack Compose · Firebase Authentication · Cloud Firestore · Foreground Service.
Hỗ trợ xây dựng bằng Google AI Studio (Gemini).

---

## Ghi chú

Thiết kế giao diện tham khảo bản mockup trong `assets/img/hero-bg.png`. Ảnh mô phỏng, không phải ảnh chụp màn hình thật của app.
