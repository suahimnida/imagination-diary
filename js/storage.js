/**
 * storage.js
 * Shared client-side data layer for the Imagination diary.
 *
 * MVP data store: entries live in localStorage under ENTRIES_KEY.
 * The in-progress diary draft (title/date/content, then chosen styles)
 * is passed between write.html -> survey.html via sessionStorage so a
 * page refresh doesn't lose it but it never pollutes the saved list.
 *
 * Swap this module out for real API calls to a database later —
 * every other page only talks to the functions below, never to
 * localStorage directly.
 */

const ENTRIES_KEY = "imagination.diary.entries";
const DRAFT_KEY = "imagination.diary.draft";
const SEEDED_KEY = "imagination.diary.seeded";

const STYLE_OPTIONS = ["카툰", "반실사", "수채화", "애니메이션", "3D"];

/**
 * First-visit preview content only, so the gallery and Diary list aren't
 * empty before anyone has generated a real illustration. Real entries
 * (created through write.html -> survey.html -> the Gemini API) are added
 * the same way regardless of whether this seed ran.
 */
function seedDemoEntriesIfEmpty() {
  if (localStorage.getItem(SEEDED_KEY)) return;
  localStorage.setItem(SEEDED_KEY, "1");
  if (readEntries().length > 0) return;

  const demo = [
    { title: "수 많은 행복이 가득 피어나는 봄", date: "2026-03-21", image: "images/spring.svg",
      content: "창밖에 벚꽃이 흩날리기 시작했다. 새 학기의 설렘과 봄바람이 뒤섞여 마음이 몽글몽글했던 하루.", styles: ["수채화"] },
    { title: "사랑하는 사람들과 함께 떠나는 여름", date: "2026-07-12", image: "images/summer.svg",
      content: "오랜만에 친구들과 바다에 갔다. 파도 소리와 웃음소리가 뒤섞여 오래 기억에 남을 것 같다.", styles: ["애니메이션"] },
    { title: "맑고 푸른 하늘에 떠나는 가을 여행", date: "2026-10-05", image: "images/autumn.svg",
      content: "단풍이 물든 산길을 오래 걸었다. 하늘이 유난히 높고 맑았던, 여행하기 좋은 하루였다.", styles: ["반실사"] },
    { title: "하얀 눈꽃이 피어나는 겨울", date: "2026-01-18", image: "images/winter.svg",
      content: "첫눈이 내렸다. 창밖을 한참 바라보다 따뜻한 차 한 잔을 마시며 하루를 마무리했다.", styles: ["카툰"] },
  ];

  demo.forEach((d, i) => {
    saveEntry({
      id: `seed_${i}`,
      title: d.title,
      date: d.date,
      content: d.content,
      styles: d.styles,
      image: d.image,
      createdAt: new Date(d.date + "T09:00:00").toISOString(),
    });
  });
}

function readEntries() {
  try {
    const raw = localStorage.getItem(ENTRIES_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error("Failed to read diary entries", err);
    return [];
  }
}

function writeEntries(entries) {
  localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
}

/** Newest first. */
function getEntries() {
  return readEntries().sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
}

function getEntry(id) {
  return readEntries().find((e) => e.id === id) || null;
}

function saveEntry(entry) {
  const entries = readEntries();
  const full = {
    id: entry.id || `entry_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    title: entry.title,
    date: entry.date,
    content: entry.content,
    styles: entry.styles || [],
    image: entry.image || null, // data URL
    createdAt: entry.createdAt || new Date().toISOString(),
  };
  entries.push(full);
  writeEntries(entries);
  return full;
}

/** Pick up to n random entries that have a generated illustration. */
function getRandomIllustrated(n) {
  const withImages = readEntries().filter((e) => !!e.image);
  const pool = [...withImages];
  const picked = [];
  while (pool.length && picked.length < n) {
    const i = Math.floor(Math.random() * pool.length);
    picked.push(pool.splice(i, 1)[0]);
  }
  return picked;
}

/* ---------------- draft (write.html -> survey.html) ---------------- */

function setDraft(draft) {
  sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

function getDraft() {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    return null;
  }
}

function clearDraft() {
  sessionStorage.removeItem(DRAFT_KEY);
}

/* ---------------- small helpers ---------------- */

function formatDateLabel(isoDate) {
  if (!isoDate) return "";
  const d = new Date(isoDate + "T00:00:00");
  if (Number.isNaN(d.getTime())) return isoDate;
  return d.toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

seedDemoEntriesIfEmpty();
