const translations = {
  ru: {
    navHome: "Главная",
    navRadi: "radi",
    navNews: "Новости",
    navIssues: "Проблемы",
    heroEyebrow: "Linux-проект",
    heroDescription: "Linux-система без лишнего. Только необходимое.",
    heroButton: "Изучить radi",
    radiDescription: "Инструмент управления пакетами в экосистеме RadiumOS.",
    radiTitle: "Просто. Быстро. Понятно.",
    radiText: "radi — концепция пакетного менеджера с лаконичным интерфейсом.",
    featureOneTitle: "Простые команды",
    featureOneText: "Понятный интерфейс командной строки.",
    featureTwoTitle: "Управление пакетами",
    featureTwoText: "Поиск и управление пакетами в одном месте.",
    featureThreeTitle: "Часть RadiumOS",
    featureThreeText: "Развивается вместе с системой.",
    consoleWelcome: "Интерактивный обзор radi",
    consoleChoose: "Выбери действие ниже.",
    consoleDisclaimer: "Демонстрация интерфейса. Реальная установка пакетов не выполняется.",
    newsTitle: "Новости",
    newsDescription: "Обновления и заметки о развитии проекта.",
    newsLoading: "Загрузка новостей...",
    issuesTitle: "Проблемы и предложения",
    issuesDescription: "Отправь описание ошибки, вопрос или идею.",
    issueTitleLabel: "Заголовок",
    issueTitlePlaceholder: "Краткое описание",
    issueTypeLabel: "Тип",
    issueTypeBug: "Ошибка",
    issueTypeIdea: "Идея",
    issueTypeQuestion: "Вопрос",
    issueDescriptionLabel: "Описание",
    issueDescriptionPlaceholder: "Опиши проблему подробнее",
    issueSubmit: "Отправить",
    issueListTitle: "Список обращений",
    issuesLoading: "Загрузка обращений...",
    issuesEmpty: "Пока нет обращений.",
    issueLocalNote: "Обращение отправляется.",
    madeBy: "Создано командой RadiumOS",
    issueSuccess: "Обращение отправлено.",
    issueError: "Не удалось отправить обращение.",
    issueBug: "Ошибка",
    issueIdea: "Идея",
    issueQuestion: "Вопрос",
    issueOpen: "Открыто",
    newsEmpty: "Пока нет опубликованных новостей.",
    newsError: "Не удалось загрузить новости.",
    issueLoadError: "Не удалось загрузить обращения.",
    radiResults: {
      help: "Доступные действия: help, version, list, info.",
      version: "Демонстрационная версия radi 0.1.0.",
      list: "Примеры пакетов: base-system, linux-kernel, radi-tools.",
      info: "radi — демонстрация пакетного менеджера RadiumOS."
    }
  },
  en: {
    navHome: "Home",
    navRadi: "radi",
    navNews: "News",
    navIssues: "Issues",
    heroEyebrow: "Linux Project",
    heroDescription: "A Linux system without unnecessary complexity.",
    heroButton: "Explore radi",
    radiDescription: "A package management tool for the RadiumOS ecosystem.",
    radiTitle: "Simple. Fast. Clear.",
    radiText: "radi is a package manager concept with a concise interface.",
    featureOneTitle: "Simple Commands",
    featureOneText: "A clear command-line interface.",
    featureTwoTitle: "Package Management",
    featureTwoText: "Search and manage packages in one place.",
    featureThreeTitle: "Part of RadiumOS",
    featureThreeText: "Developed alongside the operating system.",
    consoleWelcome: "Interactive radi Preview",
    consoleChoose: "Choose an action below.",
    consoleDisclaimer: "Interface demo. No real packages are installed.",
    newsTitle: "News",
    newsDescription: "Project updates and development announcements.",
    newsLoading: "Loading news...",
    issuesTitle: "Issues and Suggestions",
    issuesDescription: "Submit a bug report, question, or suggestion.",
    issueTitleLabel: "Title",
    issueTitlePlaceholder: "Brief summary",
    issueTypeLabel: "Type",
    issueTypeBug: "Bug",
    issueTypeIdea: "Suggestion",
    issueTypeQuestion: "Question",
    issueDescriptionLabel: "Description",
    issueDescriptionPlaceholder: "Describe the issue in detail",
    issueSubmit: "Submit",
    issueListTitle: "Issue List",
    issuesLoading: "Loading issues...",
    issuesEmpty: "No issues yet.",
    issueLocalNote: "Your report is submitted.",
    madeBy: "Created by the RadiumOS Team",
    issueSuccess: "Issue submitted.",
    issueError: "Could not submit the issue.",
    issueBug: "Bug",
    issueIdea: "Suggestion",
    issueQuestion: "Question",
    issueOpen: "Open",
    newsEmpty: "No news published yet.",
    newsError: "Could not load news.",
    issueLoadError: "Could not load issues.",
    radiResults: {
      help: "Available actions: help, version, list, info.",
      version: "radi demo version 0.1.0.",
      list: "Example packages: base-system, linux-kernel, radi-tools.",
      info: "radi is a demo package manager for RadiumOS."
    }
  }
};

let language = localStorage.getItem("radiumos.language") || "ru";

function translatePage() {
  const dictionary = translations[language];
  document.documentElement.lang = language;

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.dataset.i18n;
    if (typeof dictionary[key] === "string") {
      element.textContent = dictionary[key];
    }
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    const key = element.dataset.i18nPlaceholder;
    if (dictionary[key]) element.placeholder = dictionary[key];
  });

  const toggle = document.querySelector("#language-toggle");
  if (toggle) toggle.textContent = language === "ru" ? "EN" : "RU";

  document.dispatchEvent(new Event("languageChanged"));
}

document.querySelector("#language-toggle")?.addEventListener("click", () => {
  language = language === "ru" ? "en" : "ru";
  localStorage.setItem("radiumos.language", language);
  translatePage();
});

/* ---------- Консоль radi ---------- */

const consoleOutput = document.querySelector("#console-output");
const consoleButtons = document.querySelectorAll(".console-example");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let activeCommand = null;
let consoleTimer = null;

function appendConsoleLine(className, text) {
  const line = document.createElement("p");
  line.className = className;
  line.textContent = text;
  consoleOutput.appendChild(line);
}

function runCommand(command, animate = true) {
  const result = translations[language].radiResults[command];
  if (!consoleOutput || !result) return;

  clearTimeout(consoleTimer);
  activeCommand = command;

  consoleButtons.forEach((button) => {
    const isActive = button.dataset.command === command;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  consoleOutput.replaceChildren();
  appendConsoleLine("console-line console-cmd", `radi ${command}`);

  const showResult = () => appendConsoleLine("console-line console-result", result);

  if (animate && !reduceMotion) {
    consoleTimer = setTimeout(showResult, 220);
  } else {
    showResult();
  }
}

consoleButtons.forEach((button) => {
  button.addEventListener("click", () => runCommand(button.dataset.command));
});

// при смене языка перерисовываем уже выполненную команду
document.addEventListener("languageChanged", () => {
  if (activeCommand) runCommand(activeCommand, false);
});

/* ---------- Навигация и шапка ---------- */

const sections = document.querySelectorAll("main section[id]");
const navLinks = document.querySelectorAll(".main-nav a");
const header = document.querySelector(".site-header");

function setActiveLink(id) {
  navLinks.forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
  });
}

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) setActiveLink(entry.target.id);
    });
  }, { rootMargin: "-30% 0px -60% 0px" });

  sections.forEach((section) => observer.observe(section));
}

function onScroll() {
  if (header) header.classList.toggle("is-scrolled", window.scrollY > 8);

  // в самом низу страницы подсвечиваем последний раздел
  const atBottom =
    window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
  if (atBottom && sections.length) setActiveLink(sections[sections.length - 1].id);
}

window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

const year = document.querySelector("#year");
if (year) year.textContent = new Date().getFullYear();

translatePage();
