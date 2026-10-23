const NEVER_BLOCKED_EXACT = new Set([
  "com.android.settings", "com.samsung.android.settings", "com.google.android.settings.intelligence",
  "com.android.systemui", "com.android.launcher", "com.google.android.apps.nexuslauncher",
  "com.sec.android.app.launcher", "com.miui.home", "com.huawei.android.launcher", "oppo.launcher",
  "com.vivo.launcher", "com.android.dialer", "com.google.android.dialer", "com.samsung.android.dialer",
  "com.android.emergency", "com.android.phone", "com.android.incallui", "com.android.server.telecom",
  "com.android.chrome", "com.android.vending", "com.google.android.permissioncontroller",
  "com.google.android.gms", "com.google.android.gsf", "com.google.android.inputmethod.latin",
  "com.samsung.android.honeyboard"
]);
const SELF_PACKAGE = "com.aistudio.vesperafamily.vspxql";

// Bản 40.0 — số liệu đã đối chiếu khớp digest của asset trên GitHub Release.
const EXPECTED = {
  bytes: 79829768,
  sha256: "2d49a936d8f6e4676df5d894c50ddc1daf49eb4e651c5b6c7abbb29ba95a905d",
  sha1: "cebcc1d2c4720a42895c41f3613d1993892167ab"
};

// Site key Turnstile là giá trị CÔNG KHAI, an toàn khi nằm ở frontend.
// Khoá bí mật (secret key) KHÔNG nằm ở đây — chỉ máy chủ Functions giữ nó qua env.
const TURNSTILE_SITE_KEY = "0x4AAAAAAFDsQ5k2jkU1Ei1R";

const dayLabel = (d) => ["CN", "T2", "T3", "T4", "T5", "T6", "T7"][d.getDay()];
const toMin = (v) => { const [h, m] = v.split(":").map(Number); return h * 60 + m; };

function isNeverBlocked(pkg) {
  const p = pkg.toLowerCase();
  return NEVER_BLOCKED_EXACT.has(p)
    || p.startsWith("com.android.")
    || p.includes("inputmethod")
    || p.includes(".launcher")
    || p.endsWith("android.launcher")
    || p === "com.google.android.gms"
    || p.startsWith("com.google.android.gsf");
}

function withinWindow(nowMin, startMin, endMin) {
  return endMin >= startMin ? nowMin >= startMin && nowMin <= endMin : nowMin >= startMin || nowMin <= endMin;
}

function dayScheduled(daysRaw, today) {
  const days = daysRaw.trim();
  if (!days) return true;
  return days.split(",").some((d) => d.trim().toLowerCase() === today.toLowerCase());
}

function decide(s) {
  if (!s.pkg.trim()) return { blocked: false, reason: "Không có tên gói nên không có gì để chặn." };
  if (s.pkg.trim().toLowerCase() === SELF_PACKAGE) return { blocked: false, reason: "Đây là app Gia Đình Việt: app không tự chặn chính mình." };
  if (isNeverBlocked(s.pkg.trim())) return { blocked: false, reason: "Nhóm không bao giờ bị chặn (hệ thống, launcher, bàn phím, gọi khẩn cấp, CH Play, Play Services).", hint: "Dù bạn có tích nhầm, app vẫn chạy được — để người dùng không mất đường thoát." };
  if (!s.active) return { blocked: false, reason: "Nội quy đang tắt nên không chặn.", hint: "Bật nội quy trong Cài đặt để luật có hiệu lực." };
  if (s.reminder) return { blocked: false, reason: "Chế độ chỉ nhắc nhở: hiển thị cảnh báo nhưng không chặn.", hint: "Tắt “chỉ nhắc nhở” để chặn thật." };
  if (!dayScheduled(s.days, s.today)) return { blocked: false, reason: `Hôm nay là ${s.today}, không nằm trong ngày áp dụng của nội quy.` };
  if (s.ticked) return { blocked: true, layer: "Lớp 1 — danh sách chặn", reason: "Ứng dụng này bị chặn theo lịch của gia đình." };
  if (!withinWindow(s.nowMin, s.start, s.end) && !s.allowed) return { blocked: true, layer: "Lớp 2 — khung giờ", reason: "Đã quá giờ dùng điện thoại theo lịch của gia đình.", hint: "Thêm app vào danh sách miễn chặn để nó chạy ngoài khung giờ." };
  if (s.used >= s.cap && !s.allowed) return { blocked: true, layer: "Lớp 2 — hạn mức phút", reason: "Hôm nay đã dùng hết thời gian cho phép.", hint: `Đã dùng ${s.used}/${s.cap} phút.` };
  return { blocked: false, reason: "Được chạy: không bị tích chặn, đang trong khung giờ và còn hạn mức." };
}

function bindLab() {
  const form = document.getElementById("lab-form");
  if (!form) return;
  const out = document.getElementById("verdict");
  const el = (id) => document.getElementById(id);
  const today = dayLabel(new Date());
  document.getElementById("todayLabel").textContent =
    today + " · " + new Date().toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });

  const run = () => {
    out.textContent = "";
    const r = decide({
      pkg: el("pkg").value,
      ticked: el("ticked").checked,
      allowed: el("allowed").checked,
      active: el("active").checked,
      reminder: el("reminder").checked,
      nowMin: toMin(el("now").value || "00:00"),
      start: toMin(el("start").value || "00:00"),
      end: toMin(el("end").value || "23:59"),
      used: Number(el("used").value) || 0,
      cap: Number(el("cap").value) || 0,
      days: el("days").value,
      today
    });
    out.className = "verdict " + (r.blocked ? "block" : "allow");
    out.textContent = (r.blocked ? "BỊ CHẶN · " : "ĐƯỢC CHẠY · ") + r.reason;
    const extra = [];
    if (r.layer) extra.push("Kích hoạt ở: " + r.layer);
    if (r.hint) extra.push(r.hint);
    if (extra.length) {
      const s = document.createElement("small");
      s.textContent = extra.join(" — ");
      out.appendChild(s);
    }
  };
  form.addEventListener("input", run);
  form.addEventListener("change", run);
  run();
}

function hex(buf) {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function bindVerify() {
  const input = document.getElementById("apkfile");
  if (!input) return;
  const out = document.getElementById("verify-out");
  const fmt = (n) => n.toLocaleString("vi-VN");

  input.addEventListener("change", async () => {
    const file = input.files[0];
    if (!file) return;
    if (!window.crypto?.subtle) {
      out.className = "verdict block";
      out.textContent = "Trình duyệt không có Web Crypto (cần HTTPS hoặc localhost) nên không tính được hash.";
      return;
    }
    const sizeOk = file.size === EXPECTED.bytes;
    out.className = "verdict idle";
    out.textContent = `Đang đọc ${fmt(file.size)} byte và tính hash, vui lòng giữ nguyên tab…`;

    const t0 = performance.now();
    try {
      const buf = await file.arrayBuffer();
      const [sha256, sha1] = await Promise.all([
        crypto.subtle.digest("SHA-256", buf),
        crypto.subtle.digest("SHA-1", buf)
      ]);
      const h256 = hex(sha256), h1 = hex(sha1);
      const ok = sizeOk && h256 === EXPECTED.sha256 && h1 === EXPECTED.sha1;
      const secs = ((performance.now() - t0) / 1000).toFixed(1);
      out.className = "verdict " + (ok ? "allow" : "block");
      out.textContent = ok
        ? `KHỚP. File của bạn là đúng bản 40.0 chính thức (${secs} giây).`
        : "KHÔNG KHỚP. File này không phải bản công bố ở trên — dùng lại từ liên kết release.";
      const lines = [
        `Kích thước: ${fmt(file.size)} / ${fmt(EXPECTED.bytes)} byte ${sizeOk ? "khớp" : "lệch"}`,
        `SHA-256: ${h256} ${h256 === EXPECTED.sha256 ? "khớp" : "lệch"}`,
        `SHA-1: ${h1} ${h1 === EXPECTED.sha1 ? "khớp" : "lệch"}`
      ];
      const s = document.createElement("small");
      s.textContent = lines.join("  ·  ");
      out.appendChild(s);
    } catch (err) {
      out.className = "verdict block";
      out.textContent = "Không đọc được file: " + (err && err.message ? err.message : String(err));
    }
  });
}

/**
 * Chốt tải bằng Cloudflare Turnstile — KHONG can key tai.
 *
 * Yeu cau cua chu tai khoan (2026-10-22): "chi can qua dc cloudflare thi ko can
 * key de tai nua, bo key nhap moi tai dc khoi web di". Nghia la widget Turnstile
 * la cong duyet duy nhat: Cloudflare tu sinh token khi nguoi dung qua duoc
 * chong bot, token do du de mo lien ket tai ngay trong trinh duyet.
 *
 * Giro can thuat: day la chan bot o cua trang, KHONG phai bao mat tuyet doi.
 * Lien ket GitHub Release van cong khai, nen ai nam duoc URL van toi duoc file.
 * Copy tren trang noi dung nay thang, khong noi "khoa chat".
 */
function bindTurnstile() {
  const mount = document.getElementById("turnstile-mount");
  if (!mount) return;
  const out = document.getElementById("gate-out");
  const locked = [...document.querySelectorAll(".dl-locked")];

  const setIdle = (msg) => { out.className = "gate-out idle"; out.textContent = msg; };
  const setErr = (msg) => { out.className = "gate-out block"; out.textContent = msg; };
  const reveal = (msg) => {
    locked.forEach((b) => { b.hidden = false; });
    out.className = "gate-out allow";
    out.textContent = msg;
    const first = locked[0] && locked[0].querySelector("a");
    if (first) first.focus();
  };

  const render = () => {
    if (!window.turnstile) { setTimeout(render, 200); return; }
    window.turnstile.render(mount, {
      sitekey: TURNSTILE_SITE_KEY,
      theme: "light",
      appearance: "auto",
      callback: () => reveal("Đã qua Cloudflare. Không cần key. Liên kết tải ở dưới đã hiện."),
      "error-callback": () => setErr("Không tải được widget Cloudflare. Kiểm tra kết nối rồi tải lại trang."),
      "expired-callback": () => setIdle("Phiên xác thực hết hạn — xác thực lại để hiện liên kết tải.")
    });
  };
  render();
}

function bindCopy() {
  document.querySelectorAll(".copy").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const row = btn.closest("tr");
      const value = row && row.querySelector("[data-copy]");
      if (!value) return;
      const text = value.dataset.copy;
      try {
        await navigator.clipboard.writeText(text);
        btn.textContent = "đã chép";
      } catch {
        btn.textContent = "hãy chép thủ công";
      }
      setTimeout(() => { btn.textContent = "sao chép"; }, 1800);
    });
  });
}

function bindTheme() {
  const btn = document.getElementById("themeBtn");
  if (!btn) return;
  const saved = localStorage.getItem("gdv-theme");
  const apply = (t) => {
    document.body.dataset.theme = t;
    btn.textContent = t === "night" ? "Nền mơ màng" : "Nền rừng đêm";
    btn.setAttribute("aria-pressed", String(t === "dream"));
  };
  if (saved === "dream" || saved === "night") apply(saved);
  btn.addEventListener("click", () => {
    const next = document.body.dataset.theme === "night" ? "dream" : "night";
    apply(next);
    localStorage.setItem("gdv-theme", next);
  });
}

const TILE_SOURCES = {
  "g-y": (z, x, y) => `https://mt1.google.com/vt/lyrs=y&x=${x}&y=${y}&z=${z}`,
  "g-s": (z, x, y) => `https://mt1.google.com/vt/lyrs=s&x=${x}&y=${y}&z=${z}`,
  "g-m": (z, x, y) => `https://mt1.google.com/vt/lyrs=m&x=${x}&y=${y}&z=${z}`,
  "esri": (z, x, y) => `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}`
};

function tileFraction(lat, lon, z) {
  const n = 2 ** z;
  const rad = (lat * Math.PI) / 180;
  return {
    fx: ((lon + 180) / 360) * n,
    fy: ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * n,
    n
  };
}

function bindTiles() {
  const form = document.getElementById("tile-form");
  const wrap = document.getElementById("tiles");
  const note = document.getElementById("tiles-note");
  if (!form || !wrap || !note) return;
  const latIn = document.getElementById("t-lat");
  const lonIn = document.getElementById("t-lon");
  const zIn = document.getElementById("t-z");
  const srcIn = document.getElementById("t-src");

  const render = () => {
    const lat = Math.max(-85, Math.min(85, parseFloat(latIn.value)));
    const lon = parseFloat(lonIn.value);
    const z = parseInt(zIn.value, 10);
    const build = TILE_SOURCES[srcIn.value] || TILE_SOURCES["g-y"];
    if (!Number.isFinite(lat) || !Number.isFinite(lon) || !Number.isFinite(z)) {
      wrap.className = "tiles dead";
      wrap.textContent = "Vĩ độ / kinh độ không hợp lệ.";
      return;
    }
    const { fx, fy, n } = tileFraction(lat, lon, z);
    const cx = Math.min(n - 1, Math.max(0, Math.floor(fx)));
    const cy = Math.min(n - 1, Math.max(0, Math.floor(fy)));
    const centerUrl = build(z, cx, cy);

    const warn = srcIn.value === "esri" && z >= 19
      ? " Lưu ý: từ z19 Esri trả ô xám ở hầu hết nông thôn VN."
      : "";

    wrap.className = "tiles";
    wrap.textContent = "";
    let failed = 0;
    let loaded = 0;
    // Ban dau ghi "9 ô đang hiển thị" ngay khi moi tao the <img>: luc vao day
    // thi chua co tile nao ve, nguoi dung thay 9 o trong va tuong demo chet.
    // Dem that bang su kien load/error roi moi kheng dinh.
    const settle = () => {
      note.textContent = "";
      if (loaded === 9) {
        note.append(`9 ô 256×256 px đang hiển thị tile thật tại z${z}, tile giữa = ${cx}/${cy}. `);
      } else if (loaded === 0 && failed >= 9) {
        note.append("Không tile nào tải được từ mạng của bạn.");
      } else if (loaded === 0) {
        note.append("Đang tải 9 tile 256×256 px…");
      } else {
        note.append(`${loaded}/9 ô đã tải được tile thật tại z${z}` +
          (failed ? `, ${failed} ô lỗi.` : " — vài ô chưa về."));
      }
      const a = link(centerUrl, centerUrl);
      note.append(document.createTextNode(" "), a);
      if (warn) note.append(warn);
    };
    settle();

    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const tx = cx + dx, ty = cy + dy;
        if (tx < 0 || ty < 0 || tx >= n || ty >= n) { failed++; continue; }
        const img = document.createElement("img");
        img.alt = "";
        img.addEventListener("load", () => { loaded++; settle(); });
        img.addEventListener("error", () => { failed++; settle(); });
        img.src = build(z, tx, ty);
        wrap.appendChild(img);
      }
    }
    const pin = document.createElement("span");
    pin.className = "pin";
    pin.style.left = `${(((fx - (cx - 1)) / 3) * 100).toFixed(2)}%`;
    pin.style.top = `${(((fy - (cy - 1)) / 3) * 100).toFixed(2)}%`;
    wrap.appendChild(pin);
  };

  const link = (text, href) => {
    const a = document.createElement("a");
    a.href = href; a.target = "_blank"; a.rel = "noopener"; a.textContent = text;
    a.className = "ghost";
    return a;
  };

  form.addEventListener("input", render);
  render();
}

bindTheme();
bindTurnstile();
bindLab();
bindVerify();
bindCopy();
bindTiles();
