'use strict';

const STORAGE_KEY = 'memory-game:leaderboard';

const MAX_RESULTS = 10;


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

function formatMoves(moves) {
  return `${moves} ${pluralize(moves, ['ход', 'хода', 'ходов'])}`;
}

function compareResults(a, b) {
  if (a.moves !== b.moves) {
    return a.moves - b.moves;
  }

  return a.playedAt - b.playedAt;
}

function isValidResult(entry) {
  return Boolean(entry)
    && typeof entry === 'object'
    && Number.isFinite(entry.moves)
    && entry.moves > 0
    && Number.isFinite(entry.playedAt);
}


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
