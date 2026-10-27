# Gia Đình Việt — trang giới thiệu & tải app

Trang tĩnh giới thiệu và tải bản cài đặt cho ứng dụng Android **Gia Đình Việt** (dự thi khoa học kĩ thuật).

> Đây là **bản sao tài liệu** của trang đã xuất bản. Bản được publish thực tế nằm ở
> thư mục `web/` của workspace Qoder Sites (host `giadinhviet-…qoder.website`), do
> orchestrator publish. Repo này **không** bật GitHub Pages và **không** chứa APK,
> token hay key nào.

## Bản đang phát hành: 69.9

| Hạng mục | Giá trị |
|---|---|
| Link tải | `https://github.com/robloxhihi/giadinhviet-app/releases/download/v69.9/GiaDinhViet.apk` |
| Kích thước | `80010184` byte = **76,3 MiB** |
| SHA-256 | `e92523d68e1569fe3840eea042e51d4a631d36146d3f1c76270d8c1f74a6b2bc` |
| SHA-1 | `7593bbd94d11aa58d3ad19326fb07be04c445d24` |
| Package | `com.aistudio.vesperafamily.vspxql` |
| Chữ ký (debug keystore) | SHA-1 `AB:F2:F6:49:CB:02:29:63:DE:77:96:FC:FA:EB:2B:7C:85:94:07:E4` |

Hash đã đối chiếu bằng `certutil` trên file tải từ GitHub Release `v69.9`, khớp giá trị công bố
(`api.github.com/…/releases/tags/v69.9` → `assets[0].digest`, 80.010.184 byte).

**Mới ở 69.9 — một lô sửa theo phản hồi người dùng.**
- *Vị trí hai chiều:* máy con cũng đọc được vị trí thật của mẹ, không còn chỉ một chiều mẹ xem con.
- *Bản đồ hết "bay cả cây":* `LocationJumpGuard` (lớp lọc thuần, có unit test) bỏ phiếu sai số lớn chen giữa và phiếu nhảy chưa xác nhận; camera bám theo tới mức zoom theo dõi khi con di chuyển thật.
- *Máy mẹ thấy máy con:* "Đang dùng: <app>" + thống kê dùng app của con hiện trên trang chủ.
- *Một chiều bị khoá:* phụ huynh tự làm trắng số liệu app của mình ở **cả hai** cửa đăng telemetry (service + ViewModel), nên máy con không thấy mẹ dùng gì; `updateBlockRules` chặn role CHILD nên máy con không đặt được nội quy.
- *Pin trung thực:* hiển thị mức pin thật, chỉ báo sạc khi `isCharging` thật, in "—" khi máy không đọc được pin (notification cũng nói "chưa đọc được" thay vì "0%").

**Đã chứng minh:** `:app:testDebugUnitTest` trên GitHub Actions **xanh** rồi mới assemble — gồm `LocationJumpGuardTest` (9 case logic chống nhảy) và `TelemetryPrivacyBatteryRegressionTest` (6 test nguồn giữ #124/#126/#127/#110). SHA-256/SHA-1 ở bảng trên đã đối chiếu **khớp** `assets[0].digest` của release `v69.9`.

**Chưa làm (nói thẳng):** chưa mục-rồi-on-device vòng vị trí hai chiều, hiệu quả thật của `LocationJumpGuard` trên GPS sống, và card "Đang dùng" trên máy ghép thật — cần cài `GiaDinhViet.apk` 69.9 lên BlueStacks, bắt cặp phụ huynh↔con để xác nhận trực tiếp.

Lịch sử: **bản 49.0** thêm giờ học tập trung ba mẹ bật từ xa (ghi `studyUntil`/`studyByName`/`studyStartedAt` vào `pairings/{id}`, máy con chặn qua `AppBlockerService`; kiểm chứng BlueStacks 23-10-2026: Zalo + Facebook bị kéo về Home khi đang phiên, mở lại bình thường khi bấm "Kết thúc giờ học sớm").

Bản 48.0: bảng model AI chỉ còn model miễn phí đã đo thật (gỡ DeepSeek V4 Flash và GLM 5.3
Flash bản trả phí); bỏ khối trạng thái khoá + nút "Gỡ khoá đã nhập" trên màn trợ lý AI.
Bản 47.0 đã bỏ hiệu ứng nền vẽ lại mỗi khung hình — đo lại trên BlueStacks thì mở app 2,66 s
so với 2,72 s của bản 45, tức **không** nhanh hơn có nghĩa (phần lớn thời gian là ART nạp class
của bản debug), nhưng CPU nền khi mở app = 0,0%.

## Cấu trúc

```
gia-dinh-viet/
  index.html
  assets/
    css/style.css
    js/main.js            <- EXPECTED = số liệu bản 69.9; luồng mở khoá tải
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
  `appearance: "always"`). Giá trị hợp lệ chỉ là `always` / `execute` / `interaction-only`;
  từng để `auto` và script chết ngay tại đó — mọi handler bind phía sau không chạy, liên kết
  tải ẩn với **toàn bộ** người xem. Đã sửa và đo lại: 9/9 khối tính năng render, link tải hiện.
- Site key này hiện **không hợp lệ** với domain đã publish: Cloudflare trả lỗi `400020`
  (Invalid sitekey). Nên widget rơi vào `error-callback` và trang **mở liên kết tải thẳng**
  (fail-open) thay vì khoá người thật ngoài. Muốn chốt thật, chủ repo phải lấy Site key mới và
  thêm host `giadinhviet-9eud03puq7u.qoder.website` vào danh sách hostname của widget.
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
npx -y http-server -p 4173 -s .     # máy này không có python trên PATH
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
curl -s https://api.github.com/repos/robloxhihi/giadinhviet-app/releases/tags/v69.9 \
  | jq -r '.assets[0].digest'
```

## Công nghệ app

Kotlin · Jetpack Compose · Firebase Authentication · Cloud Firestore · AccessibilityService
(chặn mềm, không cần root — đọc tên gói đang mở qua `TYPE_WINDOW_STATE_CHANGED` rồi gọi
`GLOBAL_ACTION_HOME`, không đọc nội dung màn hình) · Foreground Service · phiên học từ xa
ghi trên `pairings/{id}` và nghe bằng snapshot listener · model miễn phí qua Orcarouter (khoá đã
nằm sẵn trong bản cài — rút được từ APK, trang đã nói rõ rủi ro này). Trang này chỉ mô tả;
không có số liệu người dùng/tải về bịa đặt.
