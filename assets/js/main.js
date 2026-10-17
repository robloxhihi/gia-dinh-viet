/* =========================================================
   CAI DAT TAI FILE APK
   Doi 3 gia tri duoi day, xong chay, xong tai.
   ========================================================= */

const CONFIG = {

  /* 1. Ten nhan vien GitHub cua ban. Vi du: "dungnt-pro" */
  githubRepo: "TEN_NGUOI_DUNG/giadinhviet",

  /* 2. Ten tag cua Release, vi du "v2". De trong "" = chua tao Release. */
  releaseTag: "",

  /* 3. Ten file APK da tai len Release. Bao gio cung khong doi thanh ten game. */
  apkFileName: "GiaDinhViet-v2.apk",

  version: "v2",
  sizeMB: "79",
  sha256: "3a4ff78653f9791afa8edec59b26d7b7ae10304e5b77374ed0f3b93f06f6a6dc"
};

/* ---------------------------------------------------------
   Khong chinh sua phia duoi neu khong can.
   --------------------------------------------------------- */

(function () {
  const localPath = "apk/" + CONFIG.apkFileName;

  const hasRelease =
    CONFIG.releaseTag &&
    CONFIG.githubRepo.indexOf("TEN_NGUOI_DUNG") === -1;

  const downloadUrl = hasRelease
    ? "https://github.com/" + CONFIG.githubRepo +
      "/releases/download/" + CONFIG.releaseTag + "/" + CONFIG.apkFileName
    : localPath;

  document.querySelectorAll("#btn-tai, #btn-tai-2").forEach(function (btn) {
    btn.setAttribute("href", downloadUrl);
    btn.setAttribute("download", CONFIG.apkFileName);
  });

  const v = document.getElementById("meta-version");
  const s = document.getElementById("meta-size");
  const sha = document.getElementById("sha");
  const repo = document.getElementById("link-repo");
  const rel = document.getElementById("link-release");

  if (v) v.textContent = CONFIG.version;
  if (s) s.textContent = CONFIG.sizeMB + " MB";
  if (sha) sha.textContent = CONFIG.sha256 || "chua cong bo";

  if (repo && CONFIG.githubRepo.indexOf("TEN_NGUOI_DUNG") === -1) {
    repo.href = "https://github.com/" + CONFIG.githubRepo;
    if (rel) rel.href = repo.href + "/releases";
  }

  /* Bao cho nguoi dung biet neu file chua duoc de vao cho */
  document.querySelectorAll("#btn-tai, #btn-tai-2").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      if (hasRelease) return;

      fetch(downloadUrl, { method: "HEAD" }).then(function (r) {
        if (r.ok) return;

        e.preventDefault();
        alert(
          "Chua tim thay file APK.\n\n" +
          "Cach 1 — local test:  copy file APK vao thu muc  apk/  trong repo.\n" +
          "Cach 2 — public:     tao Release tren GitHub, tai file len do,\n" +
          "                     roi dien releaseTag vao CONFIG trong main.js.\n\n" +
          "Duong dan hien tai: " + downloadUrl
        );
      }).catch(function () { /* mo file truc tiep thi van chay binh thuong */ });
    });
  });

  console.log(
    "%cGia Dinh Viet%c  tai tu: " + downloadUrl,
    "color:#3ee1ff;font-weight:bold", ""
  );
})();
