# Gia Đình Việt — trang giới thiệu & tải app

Trang tĩnh giới thiệu và tải bản cài đặt cho ứng dụng Android **Gia Đình Việt** (dự thi khoa học kĩ thuật).

> Đây là **bản sao tài liệu** của trang đã xuất bản. Bản được publish thực tế nằm ở
> thư mục `web/` của workspace Qoder Sites (host `giadinhviet-…qoder.website`), do
> orchestrator publish. Repo này **không** bật GitHub Pages và **không** chứa APK,
> token hay key nào.

## Bản đang phát hành: 48.0

| Hạng mục | Giá trị |
|---|---|
| Link tải | `https://github.com/robloxhihi/giadinhviet-app/releases/download/v48/GiaDinhViet.apk` |
| Kích thước | `79862672` byte = **76,2 MiB** |
| SHA-256 | `475923379866e9062e4d232dd580473f228313841164f57cb220f659d9159cf3` |
| SHA-1 | `85a9a400499c6cb52057f7d9e51bd17238eab148` |
| Package | `com.aistudio.vesperafamily.vspxql` |
| Chữ ký (debug keystore) | SHA-1 `AB:F2:F6:49:CB:02:29:63:DE:77:96:FC:FA:EB:2B:7C:85:94:07:E4` |

Hash đã đối chiếu khớp `digest` của asset trên GitHub Release.

**Mới ở 48.0:** bảng model AI chỉ còn model miễn phí đã đo thật (gỡ DeepSeek V4 Flash và GLM 5.3 Flash bản trả phí); bỏ khối trạng thái khoá + nút "Gỡ khoá đã nhập" trên màn trợ lý AI. Bản 47.0 đã bỏ hiệu ứng nền vẽ lại mỗi khung hình — đo lại trên BlueStacks thì mở app 2,66 s so với 2,72 s của bản 45, tức **không** nhanh hơn có nghĩa (phần lớn thời gian là ART nạp class của bản debug), nhưng CPU nền khi mở app = 0,0%.

## Cấu trúc

```
gia-dinh-viet/
  index.html
  assets/
    css/style.css
    js/main.js            <- EXPECTED = số liệu bản 48.0; luồng mở khoá tải
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

Trạng thái **đang chạy trên trang đã publish** (đối chiếu `assets/js/main.js`):

- Widget render bằng **Site key công khai** `0x4AAAAAAFDsQ5k2jkU1Ei1R` (theme sáng,
  `appearance: auto`).
- Khi Cloudflare báo đã giải, hàm `callback()` **hiện khối liên kết tải ngay trong
  trình duyệt**. Không có request nào lên máy chủ ở luồng này, nên **không cần Secret key**.
- `functions/` (handler Deno gọi `siteverify`) mới là code **chuẩn bị sẵn, chưa nối**:
  `main.js` không gọi `/functions/v1/app/unlock`. Muốn chốt thật phía máy chủ thì phải
  nối endpoint + nhập `TURNSTILE_SECRET_KEY` ở Settings rồi publish Functions.

> Nói thẳng: đường dẫn APK nằm trên GitHub Release công khai, nên ai biết URL vẫn tới
> được file. Chốt client-side chặn **bot ở trang này**; người thật tải qua đường sạch,
> không quảng cáo. Đây là chốt cửa nhà, không phải két sắt.

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
curl -s https://api.github.com/repos/robloxhihi/giadinhviet-app/releases/tags/v48 \
  | jq -r '.assets[0].digest'
```

## Công nghệ app

Kotlin · Jetpack Compose · Firebase Authentication · Cloud Firestore · AccessibilityService
(chặn mềm, không cần root) · Foreground Service · model miễn phí qua Orcarouter (khoá đã
nằm sẵn trong bản cài — rút được từ APK, trang đã nói rõ rủi ro này). Trang này chỉ mô tả;
không có số liệu người dùng/tải về bịa đặt.
