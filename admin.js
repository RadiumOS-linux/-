import { pb } from "./pocketbase.js";

const ADMIN_EMAIL = "az99arseniy@gmail.com";
const $ = (selector) => document.querySelector(selector);

const loginForm = $("#login-form");
const loginMessage = $("#login-message");
const editor = $("#news-editor");
const newsForm = $("#news-form");
const newsMessage = $("#news-message");
const newsList = $("#admin-news-list");
const submitButton = newsForm.querySelector('[type="submit"]');

function isAdmin() {
  return pb.authStore.isValid &&
    pb.authStore.record?.email?.toLowerCase() === ADMIN_EMAIL;
}

function message(node, text, error = false) {
  node.textContent = text;
  node.style.color = error ? "#ff7777" : "#a5ff35";
}

function showState() {
  const allowed = isAdmin();
  loginForm.hidden = allowed;
  editor.hidden = !allowed;

  if (allowed) loadNews();
}

function resetEditor() {
  delete newsForm.dataset.editingId;
  newsForm.reset();
  $("#news-published").checked = true;
  submitButton.textContent = "Сохранить новость";
  $("#cancel-edit").hidden = true;
}

function makeSlug(value) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = $("#admin-email").value.trim().toLowerCase();
  const password = $("#admin-password").value;

  if (email !== ADMIN_EMAIL) {
    message(loginMessage, "Этот адрес не имеет доступа.", true);
    return;
  }

  const button = loginForm.querySelector('[type="submit"]');
  button.disabled = true;

  try {
    // Коллекция users должна быть Auth-коллекцией PocketBase.
    await pb.collection("users").authWithPassword(email, password);

    if (!isAdmin()) {
      pb.authStore.clear();
      throw new Error("Administrator access denied");
    }

    message(loginMessage, "Вход выполнен.");
    showState();
  } catch (error) {
    console.error(error);
    message(
      loginMessage,
      "Вход не выполнен. Проверь email, пароль и настройки PocketBase.",
      true
    );
  } finally {
    button.disabled = false;
  }
});

newsForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!isAdmin()) {
    message(newsMessage, "Нет доступа.", true);
    showState();
    return;
  }

  const title = $("#news-title").value.trim();
  const content = $("#news-content").value.trim();
  const slugInput = $("#news-slug").value.trim();
  const published = $("#news-published").checked;
  const id = newsForm.dataset.editingId;

  if (!title || !content) {
    message(newsMessage, "Заполни заголовок и текст.", true);
    return;
  }

  const body = {
    title,
    content,
    slug: slugInput ? makeSlug(slugInput) : makeSlug(title),
    published
  };

  submitButton.disabled = true;

  try {
    if (id) {
      await pb.collection("news").update(id, body);
      message(newsMessage, "Изменения сохранены.");
    } else {
      await pb.collection("news").create(body);
      message(newsMessage, "Новость создана.");
    }

    resetEditor();
    await loadNews();
  } catch (error) {
    console.error(error);
    message(
      newsMessage,
      "Не удалось сохранить. Проверь поля и правила коллекции news.",
      true
    );
  } finally {
    submitButton.disabled = false;
  }
});

async function loadNews() {
  if (!isAdmin()) return;

  newsList.replaceChildren();

  try {
    const result = await pb.collection("news").getList(1, 100, {
      sort: "-created"
    });

    if (!result.items.length) {
      const empty = document.createElement("p");
      empty.className = "empty-state";
      empty.textContent = "Новостей пока нет.";
      newsList.append(empty);
      return;
    }

    for (const record of result.items) {
      const card = document.createElement("article");
      card.className = "issue-item";

      const title = document.createElement("h3");
      title.textContent = record.title;

      const status = document.createElement("p");
      status.textContent = record.published ? "Опубликовано" : "Черновик";

      const edit = document.createElement("button");
      edit.type = "button";
      edit.className = "button button-secondary";
      edit.textContent = "Редактировать";

      edit.addEventListener("click", () => {
        $("#news-title").value = record.title;
        $("#news-slug").value = record.slug || "";
        $("#news-content").value = record.content || "";
        $("#news-published").checked = record.published;

        newsForm.dataset.editingId = record.id;
        submitButton.textContent = "Сохранить изменения";
        $("#cancel-edit").hidden = false;
        newsForm.scrollIntoView({ behavior: "smooth", block: "start" });
      });

      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "issue-delete";
      remove.textContent = "Удалить";

      remove.addEventListener("click", async () => {
        if (!isAdmin()) return;
        if (!confirm(`Удалить новость «${record.title}»?`)) return;

        try {
          await pb.collection("news").delete(record.id);
          await loadNews();
        } catch (error) {
          console.error(error);
          message(newsMessage, "Не удалось удалить новость.", true);
        }
      });

      card.append(title, status, edit, remove);
      newsList.append(card);
    }
  } catch (error) {
    console.error(error);
    message(
      newsMessage,
      "Не удалось загрузить новости. Проверь права администратора.",
      true
    );
  }
}

$("#cancel-edit").addEventListener("click", resetEditor);

$("#logout-button").addEventListener("click", () => {
  pb.authStore.clear();
  resetEditor();
  newsList.replaceChildren();
  showState();
  message(loginMessage, "Вы вышли из аккаунта.");
});

showState();