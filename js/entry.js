/**
 * entry.js — shows a single diary entry's title, date, full content,
 * and generated illustration.
 */

(function renderEntry() {
  const root = document.getElementById("detailRoot");
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const entry = id ? getEntry(id) : null;

  if (!entry) {
    root.innerHTML = `
      <div class="diary-empty">
        찾을 수 없는 일기예요. 삭제되었거나 잘못된 링크일 수 있어요.<br />
        <a href="diary.html">Diary 목록으로 돌아가기</a>
      </div>`;
    return;
  }

  document.title = `${entry.title} — Imagination`;

  root.innerHTML = `
    <article class="detail-card">
      ${entry.image ? `<div class="detail-media"><img src="${entry.image}" alt="${escapeHtml(entry.title)} 일러스트" /></div>` : ""}
      <div class="detail-body">
        <div class="detail-date">${escapeHtml(formatDateLabel(entry.date))}</div>
        <h1>${escapeHtml(entry.title)}</h1>
        <p class="detail-content">${escapeHtml(entry.content)}</p>
        ${
          entry.styles && entry.styles.length
            ? `<div class="detail-styles">${entry.styles
                .map((s) => `<span>${escapeHtml(s)}</span>`)
                .join("")}</div>`
            : ""
        }
      </div>
    </article>
    <div class="footer-space"></div>`;
})();
