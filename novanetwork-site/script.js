const SERVER_IP = "play.novanetsmp.site";
const STATUS_URL = `https://api.mcsrvstat.us/2/${encodeURIComponent(SERVER_IP)}`;

const $ = (id) => document.getElementById(id);

function setText(id, value) {
  const el = $(id);
  if (el) el.textContent = value;
}

function showToast(message) {
  const toast = $("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("toast--show");
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => toast.classList.remove("toast--show"), 2200);
}

function normalizeMotd(motd) {
  if (!motd) return "—";
  if (typeof motd === "string") return motd;
  if (motd.clean && Array.isArray(motd.clean)) return motd.clean.join(" • ");
  if (motd.clean) return String(motd.clean);
  return "—";
}

function paintStatus(online) {
  const color = online ? "#22c55e" : "#ef4444";

  const small = $("statusText");
  const big = $("statusTextBig");

  setText("statusText", online ? "Online" : "Offline");
  setText("statusTextBig", online ? "Online" : "Offline");

  if (small) small.style.color = color;
  if (big) big.style.color = color;
}

async function refreshStatus() {
  try {
    // reset
    setText("statusText", "Checking…");
    setText("statusTextBig", "Checking…");
    setText("playersText", "—");
    setText("playersTextBig", "—");
    setText("playersTextBig2", "—");
    setText("versionText", "—");
    setText("versionText2", "—");
    setText("motdText", "—");
    setText("motdText2", "—");

    const res = await fetch(STATUS_URL, { cache: "no-store" });
    const data = await res.json();

    const online = !!data.online;
    paintStatus(online);

    if (!online) return;

    const onlinePlayers = data.players?.online ?? "—";
    const maxPlayers = data.players?.max ?? "—";
    const version = data.version ?? "—";
    const motd = normalizeMotd(data.motd);

    setText("playersText", `${onlinePlayers}/${maxPlayers}`);
    setText("playersTextBig", `${onlinePlayers}/${maxPlayers}`);
    setText("playersTextBig2", `${onlinePlayers}/${maxPlayers}`);

    setText("versionText", version);
    setText("versionText2", version);

    setText("motdText", motd);
    setText("motdText2", motd);
  } catch {
    paintStatus(false);
    setText("motdText", "Status check failed (API/network).");
    setText("motdText2", "Status check failed (API/network).");
  }
}

async function copyIp(btn) {
  const ip = btn?.dataset?.ip || SERVER_IP;
  try {
    await navigator.clipboard.writeText(ip);
    showToast(`Copied server IP: ${ip}`);
  } catch {
    const ta = document.createElement("textarea");
    ta.value = ip;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    showToast(`Copied server IP: ${ip}`);
  }
}

function setupMobileMenu() {
  const menuBtn = $("menuBtn");
  const mobileNav = $("mobileNav");
  if (!menuBtn || !mobileNav) return;

  const close = () => {
    mobileNav.hidden = true;
    menuBtn.setAttribute("aria-expanded", "false");
  };

  const toggle = () => {
    const isOpen = menuBtn.getAttribute("aria-expanded") === "true";
    mobileNav.hidden = isOpen;
    menuBtn.setAttribute("aria-expanded", String(!isOpen));
  };

  menuBtn.addEventListener("click", toggle);

  mobileNav.addEventListener("click", (e) => {
    const t = e.target;
    if (t?.matches?.("a")) close();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setText("year", String(new Date().getFullYear()));

  setupMobileMenu();

  $("copyIpBtn")?.addEventListener("click", (e) => copyIp(e.currentTarget));
  $("copyIpBtn2")?.addEventListener("click", (e) => copyIp(e.currentTarget));
  $("copyIpBtn3")?.addEventListener("click", (e) => copyIp(e.currentTarget));
  $("copyIpBtn4")?.addEventListener("click", (e) => copyIp(e.currentTarget));

  $("refreshStatusBtn")?.addEventListener("click", refreshStatus);
  $("refreshStatusBtn2")?.addEventListener("click", refreshStatus);

  refreshStatus();
});