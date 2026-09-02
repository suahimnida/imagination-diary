/**
 * survey.js — style selection + calls the Gemini-backed serverless
 * function to generate the diary illustration.
 *
 * Handles the three required failure states:
 *   - empty selection (client-side validation)
 *   - API error (4xx/5xx from /api/generate-illustration)
 *   - timeout (request takes too long)
 */

const MAX_STYLES = 5;
const REQUEST_TIMEOUT_MS = 30000;

(function initSurveyPage() {
  const draft = getDraft();
  if (!draft) {
    // No diary in progress — send the user back to start one.
    window.location.href = "write.html";
    return;
  }

  document.getElementById("diaryRecap").innerHTML = `
    <div class="recap-date">${escapeHtml(formatDateLabel(draft.date))}</div>
    <p class="recap-title">${escapeHtml(draft.title)}</p>
    <p class="recap-body">${escapeHtml(draft.content)}</p>
  `;

  const chipGrid = document.getElementById("chipGrid");
  const selected = new Set();

  chipGrid.innerHTML = STYLE_OPTIONS.map(
    (style) => `<button type="button" class="style-chip" data-style="${style}" aria-pressed="false">${style}</button>`
  ).join("");

  chipGrid.querySelectorAll(".style-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      const style = chip.dataset.style;
      if (selected.has(style)) {
        selected.delete(style);
        chip.setAttribute("aria-pressed", "false");
      } else {
        if (selected.size >= MAX_STYLES) return; // cap at 5
        selected.add(style);
        chip.setAttribute("aria-pressed", "true");
      }
      hideError();
    });
  });

  const errorBanner = document.getElementById("surveyError");
  const errorText = document.getElementById("surveyErrorText");
  const loadingRow = document.getElementById("loadingRow");
  const generateBtn = document.getElementById("generateBtn");

  function showError(message) {
    errorText.textContent = message;
    errorBanner.classList.add("show");
  }
  function hideError() {
    errorBanner.classList.remove("show");
  }
  function setBusy(isBusy) {
    generateBtn.disabled = isBusy;
    loadingRow.classList.toggle("show", isBusy);
  }

  generateBtn.addEventListener("click", async () => {
    hideError();

    if (selected.size === 0) {
      showError("스타일을 최소 1개 이상 선택해주세요.");
      return;
    }

    setBusy(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort("timeout"), REQUEST_TIMEOUT_MS);

    try {
      const res = await fetch("/api/generate-illustration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: draft.title,
          date: draft.date,
          content: draft.content,
          styles: Array.from(selected),
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        let message = `이미지 생성에 실패했어요. (오류 코드 ${res.status})`;
        try {
          const errJson = await res.json();
          if (errJson && errJson.error) message = errJson.error;
        } catch (_) {
          /* response wasn't JSON — keep the default message */
        }
        showError(message);
        setBusy(false);
        return;
      }

      const data = await res.json();
      if (!data.image) {
        showError("이미지를 생성하지 못했어요. 다른 스타일로 다시 시도해주세요.");
        setBusy(false);
        return;
      }

      saveEntry({
        title: draft.title,
        date: draft.date,
        content: draft.content,
        styles: Array.from(selected),
        image: data.image,
      });
      clearDraft();
      window.location.href = "diary.html";
    } catch (err) {
      clearTimeout(timeoutId);
      setBusy(false);
      if (err === "timeout" || (err && err.name === "AbortError")) {
        showError("응답이 지연되고 있어요. 잠시 후 다시 시도해주세요.");
      } else {
        showError("네트워크 오류가 발생했어요. 연결을 확인하고 다시 시도해주세요.");
      }
    }
  });
})();
