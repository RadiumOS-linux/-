
import { pb } from "./pocketbase.js";

const newsGrid = document.querySelector("#news-grid");
const issuesList = document.querySelector("#issues-list");
const issueForm = document.querySelector("#issue-form");
const issueMessage = document.querySelector("#issue-message");
const issueCount = document.querySelector("#issue-count");

function showMessage(container, message, className) {
  if (!container) return;

  const element = document.createElement("p");
  element.className = className;
  element.textContent = message;

  container.replaceChildren(element);
}

function formatDate(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
}

/* NEWS */

function renderNews(records) {
  if (!newsGrid) return;

  if (!records.length) {
    showMessage(newsGrid, "Пока опубликованных новостей нет.", "news-state");
    return;
  }

  newsGrid.replaceChildren();

  for (const item of records) {
    const card = document.createElement("article");
    card.className = "news-card";

    const header = document.createElement("div");
    header.className = "news-card-header";

    const label = document.createElement("span");
    label.className = "news-label";
    label.textContent = "RADIUMOS UPDATE";

    const date = document.createElement("time");
    date.className = "news-date";

    const formattedDate = formatDate(item.created);

    if (formattedDate) {
      date.textContent = formattedDate;
      date.dateTime = new Date(item.created).toISOString();
    }

    header.append(label, date);

    const title = document.createElement("h3");
    title.className = "news-title";
    title.textContent = item.title || "Без названия";

    const description = document.createElement("p");
    description.className = "news-description";
    description.textContent = item.content || "Описание не добавлено.";

    const footer = document.createElement("div");
    footer.className = "news-card-footer";

    const footerText = document.createElement("span");
    footerText.textContent = "RADIUMOS NEWS";

    const arrow = document.createElement("span");
    arrow.className = "news-arrow";
    arrow.textContent = "→";
    arrow.setAttribute("aria-hidden", "true");

    footer.append(footerText, arrow);
    card.append(header, title, description, footer);
    newsGrid.appendChild(card);
  }
}

async function loadNews() {
  if (!newsGrid) return;

  showMessage(newsGrid, "Загружаем новости...", "news-state");

  try {
    const result = await pb.collection("news").getList(1, 50, {
      filter: "published = true",
      sort: "-created"
    });

    renderNews(result.items);
  } catch (error) {
    console.error("Ошибка загрузки новостей:", error);
    showMessage(
      newsGrid,
      "Не удалось загрузить новости.",
      "news-state"
    );
  }
}

/* ISSUES */

function renderIssues(records) {
  if (!issuesList) return;

  if (issueCount) {
    issueCount.textContent = String(records.length);
  }

  if (!records.length) {
    showMessage(issuesList, "Пока обращений нет.", "issue-state");
    return;
  }

  issuesList.replaceChildren();

  for (const item of records) {
    const card = document.createElement("article");
    card.className = "issue-item";

    const title = document.createElement("h3");
    title.textContent = item.title || "Без названия";

    const description = document.createElement("p");
    description.textContent = item.description || "";

    const footer = document.createElement("div");
    footer.className = "issue-item-footer";

    const type = document.createElement("span");
    type.textContent = item.type || "Общее";

    const status = document.createElement("span");
    status.textContent = item.status || "Открыто";

    footer.append(type, status);
    card.append(title, description, footer);
    issuesList.appendChild(card);
  }
}

async function loadIssues() {
  if (!issuesList) return;

  showMessage(issuesList, "Загружаем обращения...", "issue-state");

  try {
    const result = await pb.collection("issues").getList(1, 50, {
      sort: "-created"
    });

    renderIssues(result.items);
  } catch (error) {
    console.error("Ошибка загрузки обращений:", error);
    showMessage(issuesList, "Не удалось загрузить обращения.", "issue-state");
  }
}

/* ISSUE FORM */

if (issueForm) {
  issueForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (issueMessage) {
      issueMessage.textContent = "Отправляем обращение...";
    }

    const formData = new FormData(issueForm);

    const title = String(formData.get("title") || "").trim();
    const type = String(formData.get("type") || "Общее").trim();
    const description = String(formData.get("description") || "").trim();

    if (!title || !description) {
      if (issueMessage) {
        issueMessage.textContent = "Заполни заголовок и описание.";
      }
      return;
    }

    try {
      await pb.collection("issues").create({
        title,
        type,
        description,
        status: "Открыто"
      });

      issueForm.reset();

      if (issueMessage) {
        issueMessage.textContent = "Обращение успешно отправлено!";
      }

      await loadIssues();
    } catch (error) {
      console.error("Ошибка отправки обращения:", error);

      if (issueMessage) {
        issueMessage.textContent =
          "Не удалось отправить обращение.";
      }
    }
  });
}

/* INITIAL LOAD */

loadNews();
loadIssues();
