# Gia Đình Việt — trang giới thiệu & tải app

Trang tĩnh giới thiệu và tải bản cài đặt cho ứng dụng Android **Gia Đình Việt** (dự thi khoa học kĩ thuật).

> Đây là **bản sao tài liệu** của trang đã xuất bản. Bản được publish thực tế nằm ở
> thư mục `web/` của workspace Qoder Sites (host `giadinhviet-…qoder.website`), do
> orchestrator publish. Repo này **không** bật GitHub Pages và **không** chứa APK,
> token hay key nào.

## Bản đang phát hành: 49.0

| Hạng mục | Giá trị |
|---|---|
| Link tải | `https://github.com/robloxhihi/giadinhviet-app/releases/download/v49/GiaDinhViet.apk` |
| Kích thước | `79879056` byte = **76,2 MiB** |
| SHA-256 | `ca8299469d589c259a22321764e796a3208af5ea2b6812e8277863e15e4e1a8e` |
| SHA-1 | `68acbced5938de091beae05c1f4cc06f6b879f1d` |
| Package | `com.aistudio.vesperafamily.vspxql` |
| Chữ ký (debug keystore) | SHA-1 `AB:F2:F6:49:CB:02:29:63:DE:77:96:FC:FA:EB:2B:7C:85:94:07:E4` |

Hash đã đối chiếu khớp `digest` của asset trên GitHub Release (`api.github.com/…/releases/tags/v49`
trả về đúng `sha256:ca8299469d589c259a22321764e796a3208af5ea2b6812e8277863e15e4e1a8e`, 79.879.056 byte).

**Mới ở 49.0 — giờ học tập trung do ba mẹ bật từ xa.** Ba mẹ bấm 25′/45′/60′ trên máy mình;
app ghi ba cột phẳng `studyUntil` / `studyByName` / `studyStartedAt` vào document
`pairings/{id}`, máy con nghe chính document đó trong `AppBlockerService` và chặn mọi app
ngoài danh sách miễn chặn cho tới hết phiên. Phiên học được xét **trước** cổng lịch, nên nó
thắng cả khi nội quy đang tắt hoặc đang ở chế độ "chỉ nhắc". Chọn `pairings/{id}` (thay vì
`agreements`) vì hai lý do: không phải qua lượt duyệt của con, và quyền đọc/ghi document đó
đã có trong rules đang chạy trên production — tính năng này ship được ngay, không chờ deploy
rules mới.

Kiểm chứng thật trên BlueStacks ngày 23-10-2026 (bản 49.0, bật Trợ năng qua đúng đường dẫn
trong app):

```
16:15:39 I/AppBlockerService: Phien hoc dang chay den 1792749066601 (boi 'qa.bluestacks')
16:15:39 I/AppBlockerService: Lich: isReminderOnly=true blocked=6
16:17:19 I/AppBlockerService: Chan com.zing.zalo (ve Home = true) — Đang giờ học tập trung do qa.bluestacks bắt đầu — còn 33 phút.
16:18:04 I/AppBlockerService: Chan com.facebook.katana (ve Home = true) — Đang giờ học tập trung do qa.bluestacks bắt đầu — còn 33 phút.
16:19:39 I/AppBlockerService: Khong co phien hoc dang chay      <- bam "Ket thuc gio hoc som"
```

Sau dòng cuối, mở lại Zalo thì `mCurrentFocus` nằm ở `com.zing.zalo` — hết chặn, đúng ý.
`isReminderOnly=true` mà vẫn chặn là bằng chứng lớp giờ học nằm trên cổng "chỉ nhắc".

**Chưa kiểm chứng trên máy:** nhánh hiển thị *chế độ xem* của card giờ học (máy con chỉ đọc,
không có nút) — tài khoản QA `con.testing@giadinhviet.vn` đang mang role PARENT nên chưa đóng
vai máy con được. Luật miễn chặn và hết hạn phiên mới chỉ có đơn vị test (10 test mới, CI xanh).

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
    js/main.js            <- EXPECTED = số liệu bản 49.0; luồng mở khoá tải
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
curl -s https://api.github.com/repos/robloxhihi/giadinhviet-app/releases/tags/v49 \
  | jq -r '.assets[0].digest'
```

## Công nghệ app

Kotlin · Jetpack Compose · Firebase Authentication · Cloud Firestore · AccessibilityService
(chặn mềm, không cần root — đọc tên gói đang mở qua `TYPE_WINDOW_STATE_CHANGED` rồi gọi
`GLOBAL_ACTION_HOME`, không đọc nội dung màn hình) · Foreground Service · phiên học từ xa
ghi trên `pairings/{id}` và nghe bằng snapshot listener · model miễn phí qua Orcarouter (khoá đã
nằm sẵn trong bản cài — rút được từ APK, trang đã nói rõ rủi ro này). Trang này chỉ mô tả;
không có số liệu người dùng/tải về bịa đặt.
