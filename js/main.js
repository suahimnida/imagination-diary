/**
 * main.js — home page ("기본 페이지")
 * Shows 3 previously generated illustrations, picked at random,
 * in the asymmetric layout from the reference (tall tile on the right).
 */

(function renderGallery() {
  const grid = document.getElementById("galleryGrid");
  const picks = getRandomIllustrated(3);

  if (picks.length === 0) {
    grid.innerHTML = `
      <div class="gallery-empty">
        아직 완성된 일러스트가 없어요.<br />
        <a href="diary.html">오늘의 일기</a>를 쓰면 첫 그림이 이곳에 걸려요.
      </div>`;
    return;
  }

  // DOM order [top-left, tall-right, bottom-left] lands correctly in the
  // 2-col grid thanks to CSS grid auto-placement — see style.css.
  const slotClasses = ["", "tile-tall", ""];

  grid.innerHTML = picks
    .map((entry, i) => {
      const cls = slotClasses[i] || "";
      return `
        <a class="gallery-tile ${cls}" href="entry.html?id=${encodeURIComponent(entry.id)}">
          <img src="${entry.image}" alt="${escapeHtml(entry.title)} 일러스트" loading="lazy" />
          <span class="tile-cap">${escapeHtml(entry.title)}</span>
        </a>`;
    })
    .join("");

  // If fewer than 3 illustrations exist yet, pad with a quiet invite tile
  // so the layout doesn't look broken while the gallery is still filling up.
  for (let i = picks.length; i < 3; i++) {
    const cls = slotClasses[i] || "";
    grid.insertAdjacentHTML(
      "beforeend",
      `<a class="gallery-tile ${cls}" href="diary.html" style="display:flex;align-items:center;justify-content:center;color:var(--muted);font-size:13px;text-align:center;padding:16px;">
        다음 일기를 기다리는 중
      </a>`
    );
  }
})();
