'use strict';

/**
 * Таблица лидеров в localStorage и форматирование данных для неё.
 * Хранятся только завершённые игры, не более 10 лучших результатов.
 */

const STORAGE_KEY = 'memory-game:leaderboard';

/** Сколько результатов хранится и показывается. */
const MAX_RESULTS = 10;

/**
 * Дата в формате ДД.ММ.ГГГГ, без времени.
 *
 * @param {number|string|Date} value — метка времени, строка или Date
 * @returns {string} например «05.10.2026»
 */
function formatDate(value) {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear());

  return `${day}.${month}.${year}`;
}

/**
 * Склонение существительного после числа: 1 ход, 2 хода, 5 ходов.
 *
 * @param {number} count — число
 * @param {string[]} forms — формы [один, два, пять]
 * @returns {string} нужная форма
 */
function pluralize(count, forms) {
  const absolute = Math.abs(count) % 100;
  const lastDigit = absolute % 10;

  if (absolute > 10 && absolute < 20) {
    return forms[2];
  }

  if (lastDigit > 1 && lastDigit < 5) {
    return forms[1];
  }

  if (lastDigit === 1) {
    return forms[0];
  }

  return forms[2];
}

/**
 * Число ходов с правильным окончанием: «1 ход», «12 ходов».
 *
 * @param {number} moves — число ходов
 * @returns {string} строка для интерфейса
 */
function formatMoves(moves) {
  return `${moves} ${pluralize(moves, ['ход', 'хода', 'ходов'])}`;
}

/**
 * Сортировка результатов: сначала меньшее число ходов,
 * при равенстве выше более ранняя игра.
 *
 * @param {Object} a — первый результат
 * @param {Object} b — второй результат
 * @returns {number} порядок сортировки
 */
function compareResults(a, b) {
  if (a.moves !== b.moves) {
    return a.moves - b.moves;
  }

  return a.playedAt - b.playedAt;
}

/**
 * Проверяет, что запись из хранилища пригодна к показу.
 *
 * @param {*} entry — запись из localStorage
 * @returns {boolean} true, если запись корректна
 */
function isValidResult(entry) {
  return Boolean(entry)
    && typeof entry === 'object'
    && Number.isFinite(entry.moves)
    && entry.moves > 0
    && Number.isFinite(entry.playedAt);
}

/**
 * Читает сохранённые результаты: отсортированные, не более MAX_RESULTS.
 *
 * @returns {Array<Object>} список результатов
 */
function getResults() {
  let raw = null;

  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Не удалось прочитать localStorage:', error);

    return [];
  }

  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .filter(isValidResult)
      .map((entry) => ({ moves: Number(entry.moves), playedAt: Number(entry.playedAt) }))
      .sort(compareResults)
      .slice(0, MAX_RESULTS);
  } catch (error) {
    console.warn('Не удалось разобрать сохранённые результаты:', error);

    return [];
  }
}

/**
 * Добавляет результат завершённой игры в рейтинг.
 * Вызывается ровно один раз на победу (см. game.js).
 *
 * @param {Object} result — результат игры
 * @param {number} result.moves — число ходов
 * @param {number} [result.playedAt] — метка времени окончания игры
 * @returns {Object} обновлённый список и место результата (или null, если не в топ-10)
 */
function saveResult(result) {
  const entry = {
    moves: Number(result.moves),
    playedAt: Number(result.playedAt === undefined ? Date.now() : result.playedAt),
  };

  const results = [...getResults(), entry].sort(compareResults).slice(0, MAX_RESULTS);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
  } catch (error) {
    console.warn('Не удалось сохранить результат:', error);
  }

  const index = results.findIndex(
    (item) => item.moves === entry.moves && item.playedAt === entry.playedAt,
  );

  return {
    results,
    position: index === -1 ? null : index + 1,
  };
}
