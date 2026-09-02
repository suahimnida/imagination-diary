/**
 * write.js — diary writing page.
 * Validates required fields (empty-input failure case) and hands the
 * draft off to survey.html via sessionStorage.
 */

(function initWritePage() {
  const form = document.getElementById("writeForm");
  const titleInput = document.getElementById("title");
  const dateInput = document.getElementById("date");
  const contentInput = document.getElementById("content");
  const formError = document.getElementById("formError");

  // Default the date field to today, in the user's local time.
  const today = new Date();
  dateInput.value = today.toISOString().slice(0, 10);

  const fields = [
    { input: titleInput, wrapper: document.getElementById("titleField") },
    { input: dateInput, wrapper: document.getElementById("dateField") },
    { input: contentInput, wrapper: document.getElementById("contentField") },
  ];

  function clearFieldErrors() {
    fields.forEach((f) => f.wrapper.classList.remove("has-error"));
    formError.classList.remove("show");
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    clearFieldErrors();

    let hasEmpty = false;
    fields.forEach((f) => {
      if (!f.input.value.trim()) {
        f.wrapper.classList.add("has-error");
        hasEmpty = true;
      }
    });

    if (hasEmpty) {
      formError.classList.add("show");
      document.getElementById("formErrorText").textContent =
        "빈 항목이 있어요. 제목, 날짜, 내용을 모두 입력해주세요.";
      fields.find((f) => f.wrapper.classList.contains("has-error")).input.focus();
      return;
    }

    setDraft({
      title: titleInput.value.trim(),
      date: dateInput.value,
      content: contentInput.value.trim(),
    });

    window.location.href = "survey.html";
  });
})();
