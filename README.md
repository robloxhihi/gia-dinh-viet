# Gia Đình Việt — trang giới thiệu & tải app

Trang tĩnh giới thiệu và tải bản cài đặt cho ứng dụng Android **Gia Đình Việt** (dự thi khoa học kĩ thuật).

> Đây là **bản sao tài liệu** của trang đã xuất bản. Bản được publish thực tế nằm ở
> thư mục `web/` của workspace Qoder Sites (host `giadinhviet-…qoder.website`), do
> orchestrator publish. Repo này **không** bật GitHub Pages và **không** chứa APK,
> token hay key nào.

## Bản đang phát hành: 69.11

| Hạng mục | Giá trị |
|---|---|
| Link tải | `https://github.com/robloxhihi/giadinhviet-app/releases/download/v69.11/GiaDinhViet.apk` |
| Phiên bản | `69.11` — versionCode `6911`, tag `v69.11` |
| Kích thước | `80010184` byte = **76,3 MiB** |
| SHA-256 | `0bd9ef47e67f1f1c4e29c443abf415c63fe562afb6f94ab5bd45b709efaf349d` |
| SHA-1 | `a2367ad44460e250b679bdf8560967342ebe1b0c` |
| Package | `com.aistudio.vesperafamily.vspxql` |
| Chữ ký (debug keystore) | SHA-1 `AB:F2:F6:49:CB:02:29:63:DE:77:96:FC:FA:EB:2B:7C:85:94:07:E4` |
| Build | GitHub Actions run `40514158937` (27-10-2026) |

Hash đã đối chiếu với `assets[0].digest` của release `v69.11` qua
`api.github.com/repos/robloxhihi/giadinhviet-app/releases/tags/v69.11` — khớp
`0bd9ef47…efaf349d`, 80.010.184 byte. SHA-1 tính lại từ file tải về.

**Mới ở 69.11 — lô sửa theo phản hồi "máy mẹ bị chặn, định vị sai, không chạy ngầm, gọi không được".**
- *Nội quy chỉ áp lên máy con:* `AppBlockerService` suy luận vai bằng hai dấu hiệu (`role` +
  `studentCode`) — hồ sơ phụ huynh cũ thiếu trường `role` trước đây vẫn bị đá về Home; nay máy đặt
  luật được `detachAllPairings()` nên hết bị chính bộ chặn của mình đánh.
- *Định vị chạy ngầm:* `background_location` và `battery` chuyển thành BẮT BUỘC trong `PermissionManager`.
  Nguyên nhân thật là Doze ngắt Foreground Service, không phải thiếu listener.
- *Chính xác khi đang xem bản đồ:* `VesperaTelemetryService` đổi `setWaitForAccurateLocation(false)`
  → `setWaitForAccurateLocation(foreground)`. Chạy nền vẫn giữ nhịp 45 s và vẫn gửi điểm sai số lớn
  (thà in "±218 m" còn hơn chờ fix vô hạn).
- *Gọi điện:* 1 → 4 server STUN trong `WebRTCManager`. **Không** phải lời hứa nối được: vẫn cần TURN
  cho NAT đối xứng/4G và cần push để đánh thức máy kia.
- *Không có dữ liệu demo:* đơn vị "demo" còn sót không tìm thấy đối tượng nào — 34 tỉnh trong
  `OfflineMapDownloader` là danh sách tile thật của tính năng bản đồ ngoại tuyến, không phải số liệu bịa.
  Hàng đợi offline ("lưu RAM, có mạng gửi về") đã có từ bản 67 (`vespera_offline_gps`, trần 250 điểm lộ trình).

**Đã chứng minh:** `:app:testDebugUnitTest` xanh trên GitHub Actions rồi mới assemble;
`FixRegressionTest` được viết lại để gate theo đúng biến mới (`isParent`) thay vì tên cũ, nên
cửa chặn vai không thể âm thầm tái phát. SHA-256/SHA-1 ở bảng trên khớp `assets[0].digest` của `v69.11`.

**Chưa làm / chưa chứng minh được (nói thẳng):** sai số ±3 m **không** đạt được bằng code app — nó
thuộc GPS thật của máy, và máy giả lập chỉ trả về một toạ độ cố định nên không dùng để kiểm chứng được;
cuộc gọi chưa cải thiện được phần NAT/push (quyết định hạ tầng, không phải một dòng sửa); card quyền
mới chỉ ép được người dùng mở màn cài đặt, vẫn không chặn cứng.

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
    js/main.js            <- EXPECTED = số liệu bản 69.11; luồng mở khoá tải
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
curl -s https://api.github.com/repos/robloxhihi/giadinhviet-app/releases/tags/v69.11 \
  | jq -r '.assets[0].digest'
```

## Công nghệ app

Kotlin · Jetpack Compose · Firebase Authentication · Cloud Firestore · AccessibilityService
(chặn mềm, không cần root — đọc tên gói đang mở qua `TYPE_WINDOW_STATE_CHANGED` rồi gọi
`GLOBAL_ACTION_HOME`, không đọc nội dung màn hình) · Foreground Service · phiên học từ xa
ghi trên `pairings/{id}` và nghe bằng snapshot listener · model miễn phí qua Orcarouter (khoá đã
nằm sẵn trong bản cài — rút được từ APK, trang đã nói rõ rủi ro này). Trang này chỉ mô tả;
không có số liệu người dùng/tải về bịa đặt.
