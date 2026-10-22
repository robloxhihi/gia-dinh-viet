# Gia Đình Việt — trang giới thiệu & tải app

Trang tĩnh giới thiệu và tải bản cài đặt cho ứng dụng Android **Gia Đình Việt** (dự thi khoa học kĩ thuật).

> Đây là **bản sao tài liệu** của trang đã xuất bản. Bản được publish thực tế nằm ở
> thư mục `web/` của workspace Qoder Sites (host `giadinhviet-…qoder.website`), do
> orchestrator publish. Repo này **không** bật GitHub Pages và **không** chứa APK,
> token hay key nào.

## Bản đang phát hành: 40.0

| Hạng mục | Giá trị |
|---|---|
| Link tải | `https://github.com/robloxhihi/giadinhviet-app/releases/download/v40/GiaDinhViet.apk` |
| Kích thước | `79829768` byte = **76,1 MiB** |
| SHA-256 | `2d49a936d8f6e4676df5d894c50ddc1daf49eb4e651c5b6c7abbb29ba95a905d` |
| SHA-1 | `cebcc1d2c4720a42895c41f3613d1993892167ab` |
| Package | `com.aistudio.vesperafamily.vspxql` |

Hash đã đối chiếu khớp `digest` của asset trên GitHub Release.

**Mới ở 40.0:** bỏ màu ngọc lam (chỉ còn giao diện tối/sáng); khung giờ chặn nhập bằng số thay vì chấm giờ; phụ huynh chặn app áp dụng ngay không cần con duyệt; thêm nút gỡ khoá AI đã nhập.

## Cấu trúc

```
gia-dinh-viet/
  index.html
  assets/
    css/style.css
    js/main.js            <- EXPECTED = số liệu bản 40.0; luồng mở khoá tải
    img/app-screens-light.png   <- mockup nền sáng, ảnh do tác giả cung cấp, KHÔNG sửa
    img/app-screens-dark.png    <- mockup nền tối, ảnh do tác giả cung cấp, KHÔNG sửa
  functions/
    index.ts              <- điểm vào Deno.serve(handler)
    handler.ts            <- gọi Cloudflare siteverify phía máy chủ
  docs/screenshots/
```

Giao diện mặc định **nền sáng**; nút đổi nền ở header giữ cả hai bảng màu. Hai ảnh mockup
được dùng nguyên bản làm ảnh giới thiệu (hero + dải tính năng), không vẽ lại, không AI sinh.

## Chốt tải bằng Cloudflare Turnstile

- Frontend render widget bằng **Site key công khai** `0x4AAAAAAFDsQ5k2jkU1Ei1R`
  (theme sáng, `appearance: auto`).
- Khi người dùng giải xong, token `cf-turnstile-response` được **POST lên
  `/functions/v1/app/unlock`** (same-origin).
- `functions/handler.ts` gọi `https://challenges.cloudflare.com/turnstile/v0/siteverify`
  bằng **Secret key đọc từ biến môi trường** `TURNSTILE_SECRET_KEY` của Functions
  (khai báo trong `prepare_site.secretNames`, người dùng nhập ở Settings).
- **Chỉ khi máy chủ trả `{ok:true}` liên kết tải mới hiện.** Không có nhánh mở khoá
  một mình ở phía trình duyệt.

> Nói thẳng: đường dẫn APK nằm trên GitHub Release công khai, nên ai biết URL vẫn tới
> được file. Turnstile chặn **bot ở trang này**; người thật tải qua đường sạch, không
> quảng cáo. Đây là chốt cửa nhà, không phải két sắt.

## Tuyệt đối không commit

Không push vào repo này (hoặc thư mục `web/` publish): file `.apk`, Secret key Turnstile,
token `ghp_…`, API key Firebase/Gemini/OpenRouter, hay bất kỳ file chứa credential.
`.gitignore` đã chặn `*.apk`/`*.zip`/`apk/`/`tmp/`.

## Chạy thử cục bộ

```bash
cd gia-dinh-viet
python -m http.server 4173
```

Mở `http://127.0.0.1:4173/`. Static server **không** chạy TypeScript và **không** proxy
Functions, nên `POST /functions/v1/app/unlock` trả 404 ở đây là bình thường — đó không phải
lỗi cloud. Endpoint chỉ hoạt động sau khi Functions được prepare + publish và Secret đã nhập.

##APK build ở đâu

Không build trên máy cá nhân. GitHub Actions trong repo mã nguồn
[`robloxhihi/giadinhviet-app`](https://github.com/robloxhihi/giadinhviet-app):
push `main` → chạy unit test + `assembleDebug`; đẩy tag `v*` → tạo Release kèm `GiaDinhViet.apk`.
Lấy SHA-256 từ API mà không cần tải file:

```bash
curl -s https://api.github.com/repos/robloxhihi/giadinhviet-app/releases/tags/v40 \
  | jq -r '.assets[0].digest'
```

## Công nghệ app

Kotlin · Jetpack Compose · Firebase Authentication · Cloud Firestore · AccessibilityService
(chặn mềm, không cần root) · Foreground Service · Gemini/OpenRouter (khoá nhập trên máy,
không nằm trong repo). Trang này chỉ mô tả; không có số liệu người dùng/tải về bịa đặt.
