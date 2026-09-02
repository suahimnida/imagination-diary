/**
 * diary.js — Diary list page.
 * Renders every saved entry, newest first, as [date / title / illustration]
 * cards in a tidy grid (positions 5,6,7,8 in the reference).
 */

(function renderDiaryList() {
  const grid = document.getElementById("diaryGrid");
  const entries = getEntries();

  if (entries.length === 0) {
    grid.outerHTML = `
      <div class="diary-empty" id="diaryGrid">
        아직 작성된 일기가 없어요.<br />
        위의 <strong>오늘의 일기쓰기</strong> 버튼으로 첫 페이지를 열어보세요.
      </div>`;
    return;
  }

  grid.innerHTML = entries
    .map(
      (entry) => `
      <a class="entry-card" href="entry.html?id=${encodeURIComponent(entry.id)}">
        <div class="card-head">
          <div class="card-date">${escapeHtml(formatDateLabel(entry.date))}</div>
          <p class="card-title">${escapeHtml(entry.title)}</p>
        </div>
        <div class="card-media">
          ${
            entry.image
              ? `<img src="${entry.image}" alt="${escapeHtml(entry.title)} 일러스트" loading="lazy" />`
              : ""
          }
        </div>
      </a>`
    )
    .join("");
})();
