// Máy chủ kiểm tra Cloudflare Turnstile cho nút tải APK.
//
// Ràng buộc bảo mật:
//  - Khoá bí mật (SECRET key) CHỈ đọc từ biến môi trường của Functions,
//    KHÔNG bao giờ có trong source, log, hay phản hồi. Tên biến: TURNSTILE_SECRET_KEY,
//    phải được khai báo trong prepare_site.secretNames và người dùng nhập ở Settings.
//  - Frontend chỉ gửi token; quyết định "hiện liên kết tải" do phản hồi {ok:true}
//    từ siteverify ở đây, không phải phía trình duyệt.
//  - Không in env, không trả exception thô hay body gốc từ upstream.

const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const SECRET_ENV = "TURNSTILE_SECRET_KEY";

type Json = Record<string, unknown>;

function json(body: Json, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
    },
  });
}

async function readToken(request: Request): Promise<string> {
  const ct = request.headers.get("content-type") || "";
  try {
    if (ct.includes("application/json")) {
      const data = (await request.json()) as Json;
      return typeof data?.token === "string" ? data.token : "";
    }
    const form = await request.formData();
    const value = form.get("cf-turnstile-response");
    return typeof value === "string" ? value : "";
  } catch {
    return "";
  }
}

export async function handler(request: Request): Promise<Response> {
  const path = new URL(request.url).pathname;
  // Gateway có thể ánh xạ bỏ đoạn tên logical "app", nên chốt theo hậu tố.
  const isUnlock = path === "/unlock" || path.endsWith("/unlock");

  // GET không thay đổi trạng thái; đây chỉ là mô tả dịch vụ, không phải tín hiệu thành công tải.
  if (request.method === "GET") {
    return json({ ok: false, service: "giadinhviet-unlock", usage: "POST {token} tới /unlock" });
  }

  if (!isUnlock) {
    return json({ ok: false, error: "not_found" }, 404);
  }

  if (request.method !== "POST") {
    return json({ ok: false, error: "method_not_allowed" }, 405);
  }

  const token = await readToken(request);
  if (!token || token.length < 8) {
    return json({ ok: false, error: "missing_token" }, 400);
  }

  const secret = Deno.env.get(SECRET_ENV) || "";
  if (!secret) {
    // Secret chưa được nhập ở Settings -> mã lỗi ổn định, nhất quán.
    return json({ ok: false, error: "service_not_configured" }, 500);
  }

  let upstream: Response;
  try {
    upstream = await fetch(SITEVERIFY_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ secret, response: token }),
      signal: AbortSignal.timeout(8000),
    });
  } catch {
    return json({ ok: false, error: "verify_unavailable" }, 502);
  }

  if (!upstream.ok) {
    return json({ ok: false, error: "verify_upstream_status" }, 502);
  }

  let result: Json;
  try {
    result = (await upstream.json()) as Json;
  } catch {
    return json({ ok: false, error: "verify_bad_response" }, 502);
  }

  const success = result.success === true;
  const reasons = Array.isArray(result["error-codes"]) ? (result["error-codes"] as string[]) : [];
  // Trả 200 cho cả hai nhánh để frontend phân biệt "không phải người" (ok:false)
  // với "endpoint chưa chạy" (404/500). Chỉ ok:true mới được coi là hợp lệ.
  return json({ ok: success, reasons });
}
