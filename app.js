const sectionDefinitions = [
  { id: "la-gavia", label: "Lección 1–2 · La Gavia, México", start: 1, end: 2, place: "La Gavia, México" },
  { id: "espana", label: "Lección 3–11 · España", start: 3, end: 11, place: "España" },
  { id: "argentina", label: "Lección 12–21 · Argentina", start: 12, end: 21, place: "Argentina" },
  { id: "puerto-rico", label: "Lección 22–26 · Puerto Rico", start: 22, end: 26, place: "Puerto Rico" },
  { id: "mexico", label: "Lección 27–52 · México", start: 27, end: 52, place: "México" },
];

const lessonCatalog = [
  { title: "La carta", english: "The letter" },
  { title: "El secreto", english: "The secret" },
  { title: "El comienzo", english: "The beginning" },
  { title: "Perdido", english: "Lost" },
  { title: "La despedida", english: "The farewell" },
  { title: "¿Maestra?", english: "Teacher?" },
  { title: "La cartera", english: "The wallet" },
  { title: "El encuentro", english: "The meeting" },
  { title: "Estaciones", english: "Stations" },
  { title: "Cuadros", english: "Paintings" },
  { title: "La demora", english: "The delay" },
  { title: "Revelaciones", english: "Revelations" },
  { title: "Un día difícil", english: "A difficult day" },
  { title: "El pasado", english: "The past" },
  { title: "Más allá", english: "Beyond" },
  { title: "Dudas", english: "Doubts" },
  { title: "Una sorpresa", english: "A surprise" },
  { title: "¿Recuerdos?", english: "Memories?" },
  { title: "La verdad", english: "The truth" },
  { title: "Un retrato", english: "A portrait" },
  { title: "El viaje", english: "The trip" },
  { title: "La llegada", english: "The arrival" },
  { title: "Una herencia", english: "An inheritance" },
  { title: "El regreso", english: "The return" },
  { title: "Una visita", english: "A visit" },
  { title: "El mensaje", english: "The message" },
  { title: "Roberto", english: "Roberto" },
  { title: "Una búsqueda", english: "A search" },
  { title: "El rescate", english: "The rescue" },
  { title: "Reencuentros", english: "Reunions" },
  { title: "La decisión", english: "The decision" },
  { title: "El conflicto", english: "The conflict" },
  { title: "La llamada", english: "The call" },
  { title: "La familia", english: "The family" },
  { title: "Una cena", english: "A dinner" },
  { title: "Las dudas", english: "The doubts" },
  { title: "La historia continúa", english: "The story continues" },
  { title: "La explicación", english: "The explanation" },
  { title: "La evidencia", english: "The evidence" },
  { title: "La verdad final", english: "The final truth" },
  { title: "Una promesa", english: "A promise" },
  { title: "La sonrisa", english: "The smile" },
  { title: "Estoy harta", english: "I have had enough" },
  { title: "Las empanadas", english: "The empanadas" },
  { title: "Tengo dudas", english: "I have doubts" },
  { title: "Así fue I", english: "That is how it happened I" },
  { title: "Así fue II", english: "That is how it happened II" },
  { title: "Así fue III", english: "That is how it happened III" },
  { title: "Así fue IV", english: "That is how it happened IV" },
  { title: "Siempre lo amó", english: "She always loved him" },
  { title: "Repaso final", english: "Final review" },
  { title: "Final", english: "Finale" },
];

let lessons = [];
let sections = [];

async function loadVocabularyData() {
  try {
    const response = await fetch('./vocabulary.json', { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Failed to load vocabulary.json: ${response.status}`);
    }
    return await response.json();
  } catch {
    return { lessons: {} };
  }
}

function buildExternalVocabularyCards(lessonNumber, lessonData) {
  return (lessonData?.vocabulary ?? []).map((entry, index) => ({
    id: `lesson-${lessonNumber}-vocab-${String(index + 1).padStart(2, '0')}`,
    front: entry.front,
    back: entry.back,
  }));
}

function buildDefaultFlashcards(entry, number, section) {
  return [
    { id: `l${number}-1`, front: entry.title, back: entry.english },
    { id: `l${number}-2`, front: `Lección ${number}`, back: `Lesson ${number}` },
    { id: `l${number}-3`, front: section.place, back: section.place },
    { id: `l${number}-4`, front: 'Estoy estudiando.', back: 'I am studying.' },
    { id: `l${number}-5`, front: '¿Cómo se dice?', back: 'How do you say it?' },
    { id: `l${number}-6`, front: 'repasar', back: 'to review' },
  ];
}

const app = document.querySelector("#app");
const STUDY_PROGRESS_STORAGE_KEY = "destinos-study-progress-v1";

const state = {
  currentLessonNumber: null,
  activeTab: "flashcards",
  flashcardMode: "due",
  flashcardDeck: [],
  flashcardIndex: 0,
  flashcardFlipped: false,
  flashcardScore: 0,
  quizMode: "due",
  quizDeck: [],
  quizIndex: 0,
  quizScore: 0,
  quizMissedItems: [],
  quizSavedDifficultItems: [],
  quizAnswered: false,
  quizSelected: null,
  quizCorrect: false,
};

let studyProgress = loadStudyProgress();

function renderLucideIcon(name, className = "h-4 w-4") {
  if (name === "house") {
    return `
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="${className}"
        style="width: 18px; height: 18px; color: currentColor; flex-shrink: 0; display: inline-block;"
        aria-hidden="true"
      >
        <path d="M15 21v-6a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v6"></path>
        <path d="M3 10.8a2 2 0 0 1 .7-1.5l7-6.1a2 2 0 0 1 2.6 0l7 6.1a2 2 0 0 1 .7 1.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
      </svg>
    `;
  }

  if (window.lucide?.icons?.[name]) {
    return window.lucide.icons[name].toSvg({
      class: className,
      "stroke-width": 2,
    });
  }
  return "";
}

function loadStudyProgress() {
  try {
    const raw = window.localStorage.getItem(STUDY_PROGRESS_STORAGE_KEY);
    if (!raw) {
      return {};
    }
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function saveStudyProgress() {
  try {
    window.localStorage.setItem(
      STUDY_PROGRESS_STORAGE_KEY,
      JSON.stringify(studyProgress),
    );
  } catch {
    // Ignore storage write failures and keep the current session running.
  }
}

function normalizeVocabularyKey(value) {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function getSharedCardKey(card) {
  return `vocab:${normalizeVocabularyKey(card.front)}`;
}

function getCardProgressKey(_lessonNumber, cardId, card = null) {
  if (card) {
    return getSharedCardKey(card);
  }
  return `card:${cardId}`;
}

function getLessonDifficultKey(lessonNumber) {
  return `lesson-difficult-${lessonNumber}`;
}

function getCardProgress(lessonNumber, cardId, card = null) {
  return studyProgress[getCardProgressKey(lessonNumber, cardId, card)] ?? null;
}

function setCardProgress(lessonNumber, cardId, progress, card = null) {
  studyProgress[getCardProgressKey(lessonNumber, cardId, card)] = progress;
  saveStudyProgress();
}

function getSavedLessonDifficultItems(lessonNumber) {
  return studyProgress[getLessonDifficultKey(lessonNumber)] ?? [];
}

function setSavedLessonDifficultItems(lessonNumber, items) {
  studyProgress[getLessonDifficultKey(lessonNumber)] = items;
  saveStudyProgress();
}

function getNowTimestamp() {
  return Date.now();
}

function getSuccessRate(progress) {
  const correct = progress?.correctCount ?? 0;
  const incorrect = progress?.incorrectCount ?? 0;
  const total = correct + incorrect;
  if (total === 0) {
    return 1;
  }
  return correct / total;
}

function isRecentlyDifficult(progress) {
  if (!progress?.lastReviewed) {
    return false;
  }
  const reviewedMs = new Date(progress.lastReviewed).getTime();
  const daysAgo = (getNowTimestamp() - reviewedMs) / (24 * 60 * 60 * 1000);
  return daysAgo <= 7 && ((progress.incorrectCount ?? 0) > 0 || progress.difficultyLevel === "hard");
}

function isCardKnown(progress) {
  return progress?.status === "mastered" || progress?.status === "suspended";
}

function isCardActiveForNormalReview(lessonNumber, card) {
  const progress = getCardProgress(lessonNumber, card.id, card);
  return !isCardKnown(progress);
}

function isCardDifficult(lessonNumber, card) {
  const progress = getCardProgress(lessonNumber, card.id, card);
  if (!progress) {
    return false;
  }
  if (isCardKnown(progress)) {
    return false;
  }
  return (
    (progress.incorrectCount ?? 0) > 0 ||
    progress.difficultyLevel === "hard" ||
    progress.difficultyLevel === "again" ||
    getSuccessRate(progress) < 0.6 ||
    isRecentlyDifficult(progress)
  );
}

function getFlashcardPriority(lessonNumber, card) {
  const progress = getCardProgress(lessonNumber, card.id, card);
  if (!progress) {
    return 10;
  }
  const nextReviewTime = progress.nextReviewDue
    ? new Date(progress.nextReviewDue).getTime()
    : getNowTimestamp();
  const overdueMs = Math.max(getNowTimestamp() - nextReviewTime, 0);
  const incorrectWeight = (progress.incorrectCount ?? 0) * 25;
  const againWeight = progress.difficultyLevel === "again" ? 40 : 0;
  const hardWeight = progress.difficultyLevel === "hard" ? 20 : 0;
  const lowSuccessWeight = getSuccessRate(progress) < 0.6 ? 15 : 0;
  return overdueMs / (60 * 60 * 1000) + incorrectWeight + againWeight + hardWeight + lowSuccessWeight;
}

function getUpcomingReviewTime(lessonNumber, card) {
  const progress = getCardProgress(lessonNumber, card.id, card);
  if (!progress?.nextReviewDue) {
    return Number.MAX_SAFE_INTEGER;
  }
  return new Date(progress.nextReviewDue).getTime();
}

function isCardDueToday(lessonNumber, card) {
  const progress = getCardProgress(lessonNumber, card.id, card);
  if (isCardKnown(progress)) {
    return false;
  }
  if (!progress?.nextReviewDue) {
    return true;
  }
  return new Date(progress.nextReviewDue).getTime() <= getNowTimestamp();
}

function getSpacedRepetitionSchedule(rating) {
  switch (rating) {
    case "again":
      return {
        intervalMs: 10 * 60 * 1000,
        status: "learning",
        difficultyLevel: "again",
        countAsCorrect: false,
      };
    case "hard":
      return {
        intervalMs: 24 * 60 * 60 * 1000,
        status: "learning",
        difficultyLevel: "hard",
        countAsCorrect: true,
      };
    case "good":
      return {
        intervalMs: 3 * 24 * 60 * 60 * 1000,
        status: "review",
        difficultyLevel: "good",
        countAsCorrect: true,
      };
    case "easy":
    default:
      return {
        intervalMs: 7 * 24 * 60 * 60 * 1000,
        status: "mastered",
        difficultyLevel: "easy",
        countAsCorrect: true,
      };
  }
}

function recordFlashcardReview(lesson, card, rating) {
  const previous = getCardProgress(lesson.number, card.id, card) ?? {
    status: "new",
    correctCount: 0,
    incorrectCount: 0,
    difficultyLevel: "new",
    easyCount: 0,
  };
  const schedule = getSpacedRepetitionSchedule(rating);
  const now = new Date().toISOString();
  let nextReviewDue = new Date(getNowTimestamp() + schedule.intervalMs).toISOString();
  let nextStatus = schedule.status;
  const nextEasyCount = rating === "easy" ? (previous.easyCount ?? 0) + 1 : 0;

  if ((schedule.countAsCorrect && (previous.correctCount ?? 0) >= 4) || nextEasyCount >= 2) {
    nextStatus = "suspended";
    nextReviewDue = new Date(getNowTimestamp() + 365 * 24 * 60 * 60 * 1000).toISOString();
  }

  const updated = {
    status: nextStatus,
    lastReviewed: now,
    nextReviewDue,
    correctCount: previous.correctCount + (schedule.countAsCorrect ? 1 : 0),
    incorrectCount: previous.incorrectCount + (schedule.countAsCorrect ? 0 : 1),
    difficultyLevel: schedule.difficultyLevel,
    easyCount: nextEasyCount,
  };

  setCardProgress(lesson.number, card.id, updated, card);

  const savedItems = getSavedLessonDifficultItems(lesson.number).filter(
    (item) => item.prompt !== card.front,
  );

  if ((rating === "again" || rating === "hard") && !isCardKnown(updated)) {
    savedItems.unshift({
      prompt: card.front,
      answer: card.back,
      options: buildQuestionOptionsFromFlashcards(lesson.flashcards, card),
    });
  }

  setSavedLessonDifficultItems(lesson.number, savedItems);
}

function markCardAsKnown(lesson, card) {
  const previous = getCardProgress(lesson.number, card.id, card) ?? {
    correctCount: 0,
    incorrectCount: 0,
    easyCount: 0,
  };

  setCardProgress(
    lesson.number,
    card.id,
    {
      status: "suspended",
      lastReviewed: new Date().toISOString(),
      nextReviewDue: new Date(getNowTimestamp() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      correctCount: previous.correctCount,
      incorrectCount: previous.incorrectCount,
      difficultyLevel: "easy",
      easyCount: Math.max(previous.easyCount ?? 0, 2),
    },
    card,
  );

  const savedItems = getSavedLessonDifficultItems(lesson.number).filter(
    (item) => item.prompt !== card.front,
  );
  setSavedLessonDifficultItems(lesson.number, savedItems);
}

function reactivateCardForStudy(lesson, card) {
  const previous = getCardProgress(lesson.number, card.id, card) ?? {
    correctCount: 0,
    incorrectCount: 0,
    easyCount: 0,
  };

  setCardProgress(
    lesson.number,
    card.id,
    {
      status: "learning",
      lastReviewed: new Date().toISOString(),
      nextReviewDue: new Date(getNowTimestamp()).toISOString(),
      correctCount: previous.correctCount,
      incorrectCount: previous.incorrectCount,
      difficultyLevel: "hard",
      easyCount: 0,
    },
    card,
  );
}

function shuffleArray(items) {
  const array = [...items];
  for (let index = array.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [array[index], array[swapIndex]] = [array[swapIndex], array[index]];
  }
  return array;
}

function createFlashcardDeck(lesson, mode = "due") {
  const shuffled = shuffleArray(lesson.flashcards);

  if (mode === "all") {
    return shuffled;
  }

  if (mode === "known") {
    return shuffled.filter((card) => isCardKnown(getCardProgress(lesson.number, card.id, card)));
  }

  if (mode === "difficult") {
    return shuffled
      .filter((card) => isCardActiveForNormalReview(lesson.number, card) && isCardDifficult(lesson.number, card))
      .sort((left, right) => getFlashcardPriority(lesson.number, right) - getFlashcardPriority(lesson.number, left));
  }

  if (mode === "ahead") {
    return shuffled
      .filter((card) => isCardActiveForNormalReview(lesson.number, card) && !isCardDueToday(lesson.number, card))
      .sort((left, right) => getUpcomingReviewTime(lesson.number, left) - getUpcomingReviewTime(lesson.number, right));
  }

  return shuffled
    .filter((card) => isCardActiveForNormalReview(lesson.number, card) && isCardDueToday(lesson.number, card))
    .sort((left, right) => getFlashcardPriority(lesson.number, right) - getFlashcardPriority(lesson.number, left));
}

function createQuizDeck(lesson) {
  return shuffleArray(lesson.quizData).map((question) => ({
    ...question,
    options: shuffleArray(question.options),
  }));
}

function buildQuestionOptionsFromFlashcards(flashcards, card) {
  const distractors = shuffleArray(
    flashcards
      .filter((candidate) => candidate.id !== card.id)
      .map((candidate) => candidate.back),
  ).slice(0, 3);

  return shuffleArray([card.back, ...distractors]);
}

function getQuizPriority(lesson, question) {
  const card = lesson.flashcards.find((item) => item.front === question.prompt);
  if (!card) {
    return 0;
  }
  const progress = getCardProgress(lesson.number, card.id, card);
  if (!progress) {
    return 10;
  }
  const nextReviewTime = progress.nextReviewDue
    ? new Date(progress.nextReviewDue).getTime()
    : getNowTimestamp();
  const overdueMs = Math.max(getNowTimestamp() - nextReviewTime, 0);
  const incorrectWeight = (progress.incorrectCount ?? 0) * 25;
  const againWeight = progress.difficultyLevel === "again" ? 40 : 0;
  const hardWeight = progress.difficultyLevel === "hard" ? 20 : 0;
  return overdueMs / (60 * 60 * 1000) + incorrectWeight + againWeight + hardWeight;
}

function createDueQuizDeck(lesson) {
  const dueQuestions = lesson.quizData.filter((question) => {
    const card = lesson.flashcards.find((item) => item.front === question.prompt);
    return card ? isCardActiveForNormalReview(lesson.number, card) && isCardDueToday(lesson.number, card) : false;
  });

  return [...dueQuestions]
    .sort((left, right) => getQuizPriority(lesson, right) - getQuizPriority(lesson, left))
    .map((question) => ({
      ...question,
      options: shuffleArray(question.options),
    }));
}

function createDifficultQuizDeck(lesson) {
  const savedItems = getSavedLessonDifficultItems(lesson.number);
  const questionsByPrompt = new Map();

  savedItems.forEach((item) => {
    questionsByPrompt.set(item.prompt, {
      ...item,
      options: shuffleArray(item.options),
    });
  });

  lesson.flashcards.forEach((card) => {
    const progress = getCardProgress(lesson.number, card.id, card);
    const lowSuccess = getSuccessRate(progress) < 0.6;
    const difficult =
      (progress?.incorrectCount ?? 0) > 0 ||
      progress?.difficultyLevel === "hard" ||
      progress?.difficultyLevel === "again" ||
      lowSuccess ||
      isRecentlyDifficult(progress);

    if (difficult && isCardActiveForNormalReview(lesson.number, card)) {
      questionsByPrompt.set(card.front, {
        prompt: card.front,
        answer: card.back,
        options: buildQuestionOptionsFromFlashcards(lesson.flashcards, card),
      });
    }
  });

  return shuffleArray([...questionsByPrompt.values()]).map((question) => ({
    ...question,
    options: shuffleArray(question.options),
  }));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getSectionForLesson(lessonNumber) {
  return sectionDefinitions.find(
    (section) => lessonNumber >= section.start && lessonNumber <= section.end,
  );
}

function buildQuizData(lesson, flashcards) {
  return flashcards.map((card) => ({
    prompt: card.front,
    answer: card.back,
    options: buildQuestionOptionsFromFlashcards(flashcards, card),
  }));
}

function buildCustomLessonContent(vocabularyData) {
  const content = {};
  const sourceLessons = vocabularyData?.lessons ?? {};

  Object.entries(sourceLessons).forEach(([lessonKey, lessonData]) => {
    const lessonNumber = Number(lessonKey);
    if (!Number.isFinite(lessonNumber)) {
      return;
    }

    const flashcards = buildExternalVocabularyCards(lessonNumber, lessonData);
    content[lessonNumber] = {
      title: lessonData.title,
      flashcards,
      quizData: buildQuizData(
        { title: lessonData.title, number: lessonNumber },
        flashcards,
      ),
    };
  });

  return content;
}

function buildLessonData(entry, index, customLessonContent) {
  const number = index + 1;
  const section = getSectionForLesson(number);
  const custom = customLessonContent[number];
  const flashcards = custom?.flashcards ?? buildDefaultFlashcards(entry, number, section);

  return {
    id: `lesson-${number}`,
    number,
    title: custom?.title ?? entry.title,
    english: entry.english,
    section,
    sectionId: section.id,
    flashcards,
    quizData: custom?.quizData ?? buildQuizData({ ...entry, number }, flashcards),
  };
}

function buildLessonCollections(vocabularyData) {
  const customLessonContent = buildCustomLessonContent(vocabularyData);
  lessons = lessonCatalog.map((entry, index) => buildLessonData(entry, index, customLessonContent));
  sections = sectionDefinitions.map((section) => ({
    ...section,
    lessons: lessons.filter((lesson) => lesson.sectionId === section.id),
  }));
}

function navigateTo(hash) {
  window.location.hash = hash;
}

function parseRoute() {
  const rawHash = window.location.hash.replace(/^#/, "") || "/";
  const segments = rawHash.split("/").filter(Boolean);

  if (segments.length === 0) {
    return { name: "home" };
  }

  if (segments[0] === "section" && segments[1]) {
    return { name: "section", sectionId: segments[1] };
  }

  if (segments[0] === "lesson" && segments[1]) {
    return { name: "lesson", lessonNumber: Number(segments[1]) };
  }

  return { name: "not-found" };
}

function resetLessonState() {
  state.currentLessonNumber = null;
  state.activeTab = "flashcards";
  state.flashcardMode = "due";
  state.flashcardDeck = [];
  state.flashcardIndex = 0;
  state.flashcardFlipped = false;
  state.flashcardScore = 0;
  state.quizMode = "due";
  state.quizDeck = [];
  state.quizIndex = 0;
  state.quizScore = 0;
  state.quizMissedItems = [];
  state.quizSavedDifficultItems = [];
  state.quizAnswered = false;
  state.quizSelected = null;
  state.quizCorrect = false;
}

function startLessonSession(lesson) {
  state.currentLessonNumber = lesson.number;
  startFlashcardRun(lesson, "due");
  state.quizSavedDifficultItems = getSavedLessonDifficultItems(lesson.number).map((item) => ({
    ...item,
    options: [...item.options],
  }));
  startQuizRun(lesson, "due");
}

function startFlashcardRun(lesson, mode = "due") {
  state.flashcardMode = mode;
  state.flashcardDeck = createFlashcardDeck(lesson, mode);
  state.flashcardIndex = 0;
  state.flashcardFlipped = false;
  state.flashcardScore = 0;
}

function startQuizRun(lesson, mode = "due") {
  state.quizMode = mode;
  if (mode === "difficult") {
    state.quizSavedDifficultItems = getSavedLessonDifficultItems(lesson.number).map((item) => ({
      ...item,
      options: [...item.options],
    }));
    state.quizDeck = createDifficultQuizDeck(lesson);
  } else if (mode === "all") {
    state.quizDeck = createQuizDeck(lesson);
  } else {
    state.quizDeck = createDueQuizDeck(lesson);
  }
  state.quizIndex = 0;
  state.quizScore = 0;
  state.quizMissedItems = [];
  state.quizAnswered = false;
  state.quizSelected = null;
  state.quizCorrect = false;
}

function finalizeQuizRun() {
  if (state.currentLessonNumber !== null) {
    const merged = new Map(
      getSavedLessonDifficultItems(state.currentLessonNumber).map((item) => [item.prompt, item]),
    );

    state.quizMissedItems.forEach((item) => {
      merged.set(item.prompt, {
        ...item,
        options: [...item.options],
      });
    });

    const difficultItems = [...merged.values()];
    setSavedLessonDifficultItems(state.currentLessonNumber, difficultItems);
    state.quizSavedDifficultItems = difficultItems.map((item) => ({
      ...item,
      options: [...item.options],
    }));
  }
}

function renderShell(content) {
  app.innerHTML = `
    <main class="min-h-screen bg-white">
      <div class="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">
        ${content}
      </div>
    </main>
  `;
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

function renderHomePage() {
  const cards = sections.map(
    (section) => `
        <button
          data-nav="section"
          data-section="${section.id}"
          class="w-full rounded-2xl bg-flash p-6 text-left text-white shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-card"
        >
          <div class="flex min-h-[176px] flex-col justify-between">
            <div>
              <p class="mb-3 text-xs uppercase tracking-[0.24em] text-white/80">Sección</p>
              <h2 class="font-display text-[28px] font-bold leading-[1.2] tracking-[-0.02em]">${escapeHtml(section.label)}</h2>
            </div>
            <div class="mt-6 flex items-center justify-between text-sm text-ocean-300">
              <span>${section.lessons.length} lecciones</span>
              <i data-lucide="arrow-right" class="h-4 w-4"></i>
            </div>
          </div>
        </button>
      `,
  );

  renderShell(`
    <section class="mx-auto max-w-5xl py-6 sm:py-10">
      <header class="px-2 pb-8 text-center">
        <h1 class="font-display text-[40px] font-extrabold tracking-[-0.03em] text-ink sm:text-[48px]">Destinos Study App</h1>
      </header>
      <div class="grid grid-cols-1 gap-4 md:grid-cols-6">
        <div class="md:col-span-2">${cards[0]}</div>
        <div class="md:col-span-2">${cards[1]}</div>
        <div class="md:col-span-2">${cards[2]}</div>
        <div class="md:col-span-3">${cards[3]}</div>
        <div class="md:col-span-3">${cards[4]}</div>
      </div>
    </section>
  `);
}

function renderSectionPage(sectionId) {
  const section = sections.find((item) => item.id === sectionId);
  if (!section) {
    renderNotFound();
    return;
  }

  const cards = section.lessons
    .map(
      (lesson) => `
        <button
          data-nav="lesson"
          data-lesson="${lesson.number}"
          class="rounded-2xl border border-line bg-white p-5 text-left transition-all hover:-translate-y-0.5 hover:border-ocean-100 hover:shadow-soft"
        >
          <p class="mb-2 text-xs font-medium uppercase tracking-[0.24em] text-muted">Lección ${lesson.number}</p>
          <h2 class="font-display text-[24px] font-bold leading-[1.25] tracking-[-0.02em] text-ink">${escapeHtml(lesson.title)}</h2>
        </button>
      `,
    )
    .join("");

  renderShell(`
    <section class="mx-auto max-w-6xl py-2 sm:py-6">
      <div class="mb-5 flex items-center justify-between gap-3">
        <button
          data-nav="home"
          class="inline-flex items-center gap-2 rounded-xl border border-line px-4 py-2.5 text-sm font-medium text-ink transition-all hover:bg-surface"
          aria-label="Inicio - volver a la página principal"
        >
          ${renderLucideIcon("house", "h-4 w-4 shrink-0")}
          Inicio
        </button>
      </div>
      <header class="px-1 pb-6 text-center">
        <h1 class="font-display text-[34px] font-extrabold leading-[1.15] tracking-[-0.03em] text-ink sm:text-[42px]">${escapeHtml(section.label)}</h1>
      </header>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        ${cards}
      </div>
    </section>
  `);
}

function renderProgressBar(current, total, score) {
  const progress = total === 0 ? 0 : (current / total) * 100;
  return `
    <div class="mb-4 px-6">
      <div class="mb-1 flex justify-between text-xs text-muted">
        <span>${current} / ${total}</span>
        <span>Score: ${score}</span>
      </div>
      <div class="h-2 w-full rounded-full bg-line">
        <div class="progress-fill h-2 rounded-full bg-ocean-500" style="width: ${progress}%"></div>
      </div>
    </div>
  `;
}

function renderStats(lesson) {
  const summary = lesson.flashcards.reduce(
    (accumulator, card) => {
      const progress = getCardProgress(lesson.number, card.id, card);
      if (!progress) {
        accumulator.due += 1;
        return accumulator;
      }
      if (isCardKnown(progress)) {
        accumulator.mastered += 1;
      } else {
        accumulator.learning += 1;
      }
      if (isCardDueToday(lesson.number, card)) {
        accumulator.due += 1;
      }
      return accumulator;
    },
    { mastered: 0, learning: 0, due: 0 },
  );

  return `
    <div class="mt-6 px-6 pb-6">
      <p class="mb-3 text-xs uppercase tracking-[0.24em] text-[#999999]">Your Progress</p>
      <div class="grid grid-cols-3 gap-3">
        <div class="rounded-xl bg-[#F0F0F0] p-3 text-center">
          <p class="text-xl font-bold text-success">${summary.mastered}</p>
          <p class="text-xs text-muted">Mastered</p>
        </div>
        <div class="rounded-xl bg-[#F0F0F0] p-3 text-center">
          <p class="text-xl font-bold text-ocean-500">${summary.learning}</p>
          <p class="text-xs text-muted">Learning</p>
        </div>
        <div class="rounded-xl bg-[#F0F0F0] p-3 text-center">
          <p class="text-xl font-bold text-[#999999]">${summary.due}</p>
          <p class="text-xs text-muted">Due Today</p>
        </div>
      </div>
    </div>
  `;
}

function renderFlashcardsTab(lesson) {
  const cards = state.flashcardDeck;
  const modeButton = (mode, label) => `
    <button
      data-action="set-flashcard-mode"
      data-flashcard-mode="${mode}"
      class="rounded-lg px-3 py-2 text-sm font-medium transition-all ${
        state.flashcardMode === mode ? "bg-sun text-ink" : "bg-[#E5E5E5] text-muted"
      }"
    >
      ${label}
    </button>
  `;

  if (cards.length === 0) {
    const emptyMessage =
      state.flashcardMode === "difficult"
        ? "No hay tarjetas difíciles pendientes."
        : state.flashcardMode === "known"
          ? "No hay tarjetas conocidas guardadas."
        : state.flashcardMode === "ahead"
          ? "No hay tarjetas futuras para adelantar."
          : state.flashcardMode === "all"
            ? "No hay tarjetas disponibles en este modo."
            : "No hay tarjetas pendientes hoy";

    const emptyDescription =
      state.flashcardMode === "due"
        ? "Tu progreso se guardó en este navegador. Puedes estudiar otro modo si quieres seguir repasando."
        : "Tu progreso se guardó en este navegador y seguirá disponible cuando vuelvas.";

    return `
      <div class="px-6">
        <div class="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
          ${modeButton("due", "Tarjetas de hoy")}
          ${modeButton("difficult", "Repasar difíciles")}
          ${modeButton("ahead", "Próximas tarjetas")}
          ${modeButton("known", "Tarjetas conocidas")}
          ${modeButton("all", "Todas las tarjetas")}
        </div>
      </div>
      ${renderProgressBar(0, 0, 0)}
      <div class="px-6">
        <div class="rounded-2xl border border-line bg-gradient-to-br from-surface to-white p-8 text-center">
          <h3 class="font-display text-2xl font-bold tracking-[-0.02em] text-ink">${emptyMessage}</h3>
          <p class="mt-2 text-sm text-muted">${emptyDescription}</p>
        </div>
      </div>
      ${renderStats(lesson)}
    `;
  }

  if (state.flashcardIndex >= cards.length) {
    return renderResults("flashcards", cards.length, cards.length);
  }

  const currentCard = cards[state.flashcardIndex];

  return `
    <div class="px-6">
      <div class="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
        ${modeButton("due", "Tarjetas de hoy")}
        ${modeButton("difficult", "Repasar difíciles")}
        ${modeButton("ahead", "Próximas tarjetas")}
        ${modeButton("known", "Tarjetas conocidas")}
        ${modeButton("all", "Todas las tarjetas")}
      </div>
    </div>
    ${renderProgressBar(state.flashcardIndex, cards.length, state.flashcardScore)}
    <div class="px-6">
      <button
        data-action="flip-card"
        class="flashcard mx-auto block w-full max-w-[400px] cursor-pointer focus:outline-none"
        aria-label="Flip flashcard"
      >
        <div class="flashcard-inner ${state.flashcardFlipped ? "is-flipped" : ""} relative h-[220px] w-full">
          <div class="flashcard-face absolute inset-0 rounded-2xl border border-ocean-800 bg-flash p-6 text-white">
            <div class="flex h-full flex-col items-center justify-center">
              <p class="mb-3 text-xs uppercase tracking-[0.24em] text-white">Español</p>
              <p class="text-center font-body text-2xl font-bold">${escapeHtml(currentCard.front)}</p>
              <p class="mt-4 flex items-center gap-1 text-xs text-ocean-300">
                <i data-lucide="rotate-cw" class="h-3.5 w-3.5"></i>
                tap to flip
              </p>
            </div>
          </div>
          <div class="flashcard-face flashcard-back absolute inset-0 rounded-2xl border border-line bg-gradient-to-br from-surface to-white p-6 text-ink">
            <div class="flex h-full flex-col items-center justify-center">
              <p class="mb-3 text-xs uppercase tracking-[0.24em] text-ink">English</p>
              <p class="text-center font-body text-2xl font-bold">${escapeHtml(currentCard.back)}</p>
            </div>
          </div>
        </div>
      </button>
      <div class="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <button
          data-action="review-card"
          data-rating="again"
          class="inline-flex items-center justify-center gap-2 rounded-xl border border-[#FECACA] bg-[#FEE2E2] px-4 py-2.5 text-sm font-medium text-danger transition-all hover:brightness-95"
        >
          <i data-lucide="x" class="h-4 w-4"></i>
          Again
        </button>
        <button
          data-action="review-card"
          data-rating="hard"
          class="inline-flex items-center justify-center gap-2 rounded-xl border border-[#FDE68A] bg-[#FEF3C7] px-4 py-2.5 text-sm font-medium text-[#B45309] transition-all hover:brightness-95"
        >
          <i data-lucide="minus" class="h-4 w-4"></i>
          Hard
        </button>
        <button
          data-action="review-card"
          data-rating="good"
          class="inline-flex items-center justify-center gap-2 rounded-xl border border-[#86EFAC] bg-[#DCFCE7] px-4 py-2.5 text-sm font-medium text-success transition-all hover:brightness-95"
        >
          <i data-lucide="check" class="h-4 w-4"></i>
          Good
        </button>
        <button
          data-action="review-card"
          data-rating="easy"
          class="inline-flex items-center justify-center gap-2 rounded-xl border border-ocean-100 bg-ocean-50 px-4 py-2.5 text-sm font-medium text-ocean-500 transition-all hover:brightness-95"
        >
          <i data-lucide="sparkles" class="h-4 w-4"></i>
          Easy
        </button>
      </div>
      ${
        state.flashcardMode === "known"
          ? `
            <div class="mt-3 flex justify-center">
              <button
                data-action="reactivate-card"
                class="rounded-xl border border-line bg-white px-4 py-2 text-sm font-medium text-muted transition-all hover:bg-surface"
              >
                Reactivar tarjeta
              </button>
            </div>
          `
          : `
            <div class="mt-3 flex justify-center">
              <button
                data-action="mark-known"
                class="rounded-xl border border-line bg-white px-4 py-2 text-sm font-medium text-muted transition-all hover:bg-surface"
              >
                Ya la sé
              </button>
            </div>
          `
      }
    </div>
    ${renderStats(lesson)}
  `;
}

function renderQuizTab(lesson) {
  const questions = state.quizDeck;

  const modeButton = (mode, label) => `
    <button
      data-action="set-quiz-mode"
      data-quiz-mode="${mode}"
      class="rounded-lg px-3 py-2 text-sm font-medium transition-all ${
        state.quizMode === mode ? "bg-sun text-ink" : "bg-[#E5E5E5] text-muted"
      }"
    >
      ${label}
    </button>
  `;

  if (questions.length === 0) {
    const emptyMessage =
      state.quizMode === "difficult"
        ? "No hay tarjetas difíciles pendientes."
        : state.quizMode === "due"
          ? "No hay tarjetas pendientes hoy para el quiz."
          : "No hay preguntas disponibles en este modo.";

    return `
      <div class="px-6">
        <div class="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
          ${modeButton("due", "Repasar hoy")}
          ${modeButton("difficult", "Repasar difíciles")}
          ${modeButton("all", "Practicar todo")}
        </div>
        <div class="rounded-2xl border border-line bg-gradient-to-br from-surface to-white p-8 text-center">
          <h3 class="font-display text-2xl font-bold tracking-[-0.02em] text-ink">${emptyMessage}</h3>
        </div>
      </div>
      ${renderStats(lesson)}
    `;
  }

  if (state.quizIndex >= questions.length) {
    return renderResults("quiz", state.quizScore, questions.length);
  }

  const question = questions[state.quizIndex];
  const options = question.options
    .map((option) => {
      const selected = state.quizSelected === option;
      const isCorrect = state.quizAnswered && option === question.answer;
      const isWrong = state.quizAnswered && selected && option !== question.answer;

      let classes = "w-full rounded-xl border-2 px-4 py-3 text-left text-sm font-medium transition-all ";

      if (!state.quizAnswered) {
        classes += "border-ocean-500 bg-ocean-500 text-white hover:brightness-95";
      } else if (isCorrect) {
        classes += "border-[#22C55E] bg-[#22C55E] text-white";
      } else if (isWrong) {
        classes += "border-[#EF4444] bg-[#EF4444] text-white";
      } else {
        classes += "border-line bg-white text-muted";
      }

      return `
        <button
          data-action="select-answer"
          data-answer="${escapeHtml(option)}"
          ${state.quizAnswered ? "disabled" : ""}
          class="${classes}"
        >
          ${escapeHtml(option)}
        </button>
      `;
    })
    .join("");

  return `
    <div class="px-6">
      <div class="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
        ${modeButton("due", "Repasar hoy")}
        ${modeButton("difficult", "Repasar difíciles")}
        ${modeButton("all", "Practicar todo")}
      </div>
    </div>
    ${renderProgressBar(state.quizIndex, questions.length, state.quizScore)}
    <div class="px-6">
      <div class="mb-4 rounded-2xl border border-line bg-gradient-to-br from-surface to-white p-6 text-center">
        <p class="mb-2 text-xs uppercase tracking-[0.24em] text-ink">Translate:</p>
        <p class="text-xl font-bold text-ink">${escapeHtml(question.prompt)}</p>
      </div>
      <div class="grid grid-cols-1 gap-3">
        ${options}
      </div>
      ${
        state.quizAnswered
          ? `
            <div class="mt-4 flex justify-center">
              <button
                data-action="next-question"
                class="rounded-xl bg-sun px-5 py-2.5 text-sm font-medium text-ink transition-all hover:brightness-95"
              >
                ${state.quizIndex === questions.length - 1 ? "Ver resultados" : "Siguiente"}
              </button>
            </div>
          `
          : ""
      }
    </div>
    ${renderStats(lesson)}
  `;
}

function renderResults(mode, score, total) {
  const reviewSection =
    mode === "quiz"
      ? `
        <div class="mt-6 rounded-2xl border border-line bg-white p-5 text-left">
          <h3 class="mb-3 font-display text-xl font-bold tracking-[-0.02em] text-ink">Repaso de errores</h3>
          ${
            state.quizMissedItems.length === 0
              ? `<p class="text-sm text-muted">¡Todo correcto!</p>`
              : `
                <div class="space-y-3">
                  ${state.quizMissedItems
                    .map(
                      (item) => `
                        <div class="rounded-xl bg-[#F8F8F8] px-4 py-3 text-sm text-ink">
                          <span class="font-medium">${escapeHtml(item.prompt)}</span>
                          <span class="mx-2 text-muted">→</span>
                          <span>${escapeHtml(item.answer)}</span>
                        </div>
                      `,
                    )
                    .join("")}
                </div>
              `
          }
        </div>
        <div class="mt-4 flex flex-wrap justify-center gap-3">
          <button
            data-action="set-quiz-mode"
            data-quiz-mode="due"
            class="rounded-xl border border-line bg-white px-5 py-2.5 text-sm font-medium text-ink transition-all hover:bg-surface"
          >
            Repasar hoy
          </button>
          <button
            data-action="set-quiz-mode"
            data-quiz-mode="difficult"
            class="rounded-xl border border-line bg-white px-5 py-2.5 text-sm font-medium text-ink transition-all hover:bg-surface"
          >
            Repasar difíciles
          </button>
          <button
            data-action="set-quiz-mode"
            data-quiz-mode="all"
            class="rounded-xl border border-line bg-white px-5 py-2.5 text-sm font-medium text-ink transition-all hover:bg-surface"
          >
            Practicar todo
          </button>
        </div>
      `
      : "";

  return `
    <div class="px-6 text-center">
      <div class="rounded-2xl border border-line bg-[#F0F0F0] p-8">
        <div class="mb-4 text-5xl">🎉</div>
        <h2 class="mb-2 font-display text-2xl font-bold tracking-[-0.02em] text-ink">¡Bien hecho!</h2>
        <p class="mb-1 text-lg text-success">${score} / ${total} correct</p>
        <p class="mb-6 text-sm text-muted">${Math.round((score / Math.max(total, 1)) * 100)}% accuracy</p>
        <button
          data-action="${mode === "flashcards" ? "restart-flashcards" : "restart-quiz"}"
          class="rounded-xl bg-ocean-500 px-6 py-3 font-medium text-white transition-all hover:brightness-95"
        >
          Play Again
        </button>
        ${reviewSection}
      </div>
    </div>
  `;
}

function renderLessonPage(lessonNumber) {
  const lesson = lessons.find((item) => item.number === lessonNumber);
  if (!lesson) {
    renderNotFound();
    return;
  }

  if (state.currentLessonNumber !== lesson.number) {
    startLessonSession(lesson);
  }

  if (state.flashcardDeck.length === 0) {
    startFlashcardRun(lesson);
  }

  if (state.activeTab === "quiz" && state.quizDeck.length === 0) {
    startQuizRun(lesson, state.quizMode);
  }

  renderShell(`
    <section class="mx-auto max-w-3xl">
      <div class="px-6 pb-3 pt-2 text-center">
        <h1 class="font-display text-[32px] font-extrabold leading-[1.15] tracking-[-0.03em] text-ink">Lección ${lesson.number} - ${escapeHtml(lesson.title)}</h1>
        <p class="mt-1 text-sm text-muted">Práctica de Vocabulario</p>
      </div>
      <div class="mb-4 flex justify-center gap-2 px-6">
        <button
          data-nav="section"
          data-section="${lesson.sectionId}"
          class="inline-flex items-center gap-2 rounded-xl border border-line px-4 py-2.5 text-sm font-medium text-ink transition-all hover:bg-surface"
        >
          <i data-lucide="arrow-left" class="h-4 w-4"></i>
          Atrás
        </button>
        <button
          data-nav="home"
          class="inline-flex items-center gap-2 rounded-xl border border-line px-4 py-2.5 text-sm font-medium text-ink transition-all hover:bg-surface"
          aria-label="Inicio - volver a la página principal"
        >
          ${renderLucideIcon("house", "h-4 w-4 shrink-0")}
          Inicio
        </button>
      </div>
      <div class="mb-4 flex gap-2 px-6">
        <button
          data-action="set-tab"
          data-tab="flashcards"
          class="flex-1 rounded-lg py-2 text-sm font-medium transition-all ${state.activeTab === "flashcards" ? "bg-sun text-ink" : "bg-[#E5E5E5] text-muted"}"
        >
          Tarjetas
        </button>
        <button
          data-action="set-tab"
          data-tab="quiz"
          class="flex-1 rounded-lg py-2 text-sm font-medium transition-all ${state.activeTab === "quiz" ? "bg-sun text-ink" : "bg-[#E5E5E5] text-muted"}"
        >
          Quiz
        </button>
      </div>
      <div>
        ${state.activeTab === "flashcards" ? renderFlashcardsTab(lesson) : renderQuizTab(lesson)}
      </div>
    </section>
  `);
}

function renderNotFound() {
  renderShell(`
    <section class="mx-auto max-w-xl px-6 py-16 text-center">
      <div class="rounded-2xl border border-line bg-[#F0F0F0] p-8">
        <h1 class="font-display text-3xl font-bold tracking-[-0.02em] text-ink">Página no encontrada</h1>
        <button data-nav="home" class="mt-6 rounded-xl bg-ocean-500 px-6 py-3 font-medium text-white">Inicio</button>
      </div>
    </section>
  `);
}

function renderApp() {
  const route = parseRoute();

  if (route.name === "home") {
    renderHomePage();
    return;
  }

  if (route.name === "section") {
    renderSectionPage(route.sectionId);
    return;
  }

  if (route.name === "lesson") {
    renderLessonPage(route.lessonNumber);
    return;
  }

  renderNotFound();
}

document.addEventListener("click", (event) => {
  const navTarget = event.target.closest("[data-nav]");
  if (navTarget) {
    const destination = navTarget.dataset.nav;
    if (destination === "home") {
      resetLessonState();
      navigateTo("/");
      return;
    }
    if (destination === "section") {
      resetLessonState();
      navigateTo(`/section/${navTarget.dataset.section}`);
      return;
    }
    if (destination === "lesson") {
      resetLessonState();
      navigateTo(`/lesson/${navTarget.dataset.lesson}`);
      return;
    }
  }

  const actionTarget = event.target.closest("[data-action]");
  if (!actionTarget) {
    return;
  }

  const route = parseRoute();
  if (route.name !== "lesson") {
    return;
  }

  const lesson = lessons.find((item) => item.number === route.lessonNumber);
  if (!lesson) {
    return;
  }

  switch (actionTarget.dataset.action) {
    case "set-tab":
      state.activeTab = actionTarget.dataset.tab;
      if (state.activeTab === "flashcards") {
        state.flashcardFlipped = false;
      }
      if (state.activeTab === "quiz" && state.quizDeck.length === 0) {
        startQuizRun(lesson, state.quizMode);
      }
      renderApp();
      return;
    case "set-flashcard-mode":
      startFlashcardRun(lesson, actionTarget.dataset.flashcardMode);
      renderApp();
      return;
    case "set-quiz-mode":
      startQuizRun(lesson, actionTarget.dataset.quizMode);
      renderApp();
      return;
    case "flip-card":
      if (state.activeTab === "flashcards" && state.flashcardIndex < state.flashcardDeck.length) {
        state.flashcardFlipped = !state.flashcardFlipped;
      }
      break;
    case "review-card": {
      const currentCard = state.flashcardDeck[state.flashcardIndex];
      if (!currentCard) {
        break;
      }
      const rating = actionTarget.dataset.rating;
      recordFlashcardReview(lesson, currentCard, rating);
      if (rating !== "again") {
        state.flashcardScore += 1;
      }
      state.flashcardIndex += 1;
      state.flashcardFlipped = false;
      break;
    }
    case "mark-known": {
      const currentCard = state.flashcardDeck[state.flashcardIndex];
      if (!currentCard) {
        break;
      }
      markCardAsKnown(lesson, currentCard);
      state.flashcardIndex += 1;
      state.flashcardFlipped = false;
      break;
    }
    case "reactivate-card": {
      const currentCard = state.flashcardDeck[state.flashcardIndex];
      if (!currentCard) {
        break;
      }
      reactivateCardForStudy(lesson, currentCard);
      state.flashcardIndex += 1;
      state.flashcardFlipped = false;
      break;
    }
    case "restart-flashcards":
      startFlashcardRun(lesson, state.flashcardMode);
      break;
    case "select-answer":
      if (!state.quizAnswered) {
        const selected = actionTarget.dataset.answer;
        const question = state.quizDeck[state.quizIndex];
        state.quizSelected = selected;
        state.quizAnswered = true;
        state.quizCorrect = selected === question.answer;
        if (state.quizCorrect) {
          state.quizScore += 1;
        } else {
          state.quizMissedItems.push({
            prompt: question.prompt,
            answer: question.answer,
            options: [...question.options],
          });
        }
      }
      break;
    case "next-question":
      if (state.quizIndex === state.quizDeck.length - 1) {
        finalizeQuizRun();
      }
      state.quizIndex += 1;
      state.quizAnswered = false;
      state.quizSelected = null;
      state.quizCorrect = false;
      break;
    case "restart-quiz":
      startQuizRun(lesson, state.quizMode);
      break;
    default:
      break;
  }

  renderApp();
});

window.addEventListener("hashchange", renderApp);

async function initializeApp() {
  app.innerHTML = `
    <main class="min-h-screen bg-white">
      <div class="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-6 sm:px-6">
        <p class="text-sm font-medium text-muted">Loading vocabulary…</p>
      </div>
    </main>
  `;

  const vocabularyData = await loadVocabularyData();
  buildLessonCollections(vocabularyData);

  if (!window.location.hash) {
    navigateTo("/");
  } else {
    renderApp();
  }
}

initializeApp();
