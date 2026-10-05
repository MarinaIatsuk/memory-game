'use strict';


const MISMATCH_DELAY = 1000;
const WIN_MODAL_DELAY = 450;

const gameState = {
  cards: [],
  firstPickUid: null,
  moves: 0,
  pairsFound: 0,
  isLocked: false,
  isFinished: false,
};

let boardView = null;
let countersView = null;

let mismatchTimerId = null;
let winTimerId = null;

function cancelGameTimers() {
  if (mismatchTimerId !== null) {
    clearTimeout(mismatchTimerId);
    mismatchTimerId = null;
  }

  if (winTimerId !== null) {
    clearTimeout(winTimerId);
    winTimerId = null;
  }
}


function setBoardLocked(locked) {
  gameState.isLocked = locked;
  boardView.setLocked(locked);
}

function updateCounters() {
  countersView.update({ moves: gameState.moves, pairsFound: gameState.pairsFound });
}


function findCard(uid) {
  return gameState.cards.find((card) => card.uid === uid);
}

function startGame() {
  cancelGameTimers();

  gameState.cards = createDeck();
  gameState.firstPickUid = null;
  gameState.moves = 0;
  gameState.pairsFound = 0;
  gameState.isFinished = false;

  setBoardLocked(false);
  boardView.render(gameState.cards);
  updateCounters();
}


function restartGame() {
  closeModal();
  startGame();
}


function showLeaderboardModal() {
  openModal({
    title: 'Таблица лидеров',
    content: createLeaderboardContent(getResults()),
    actions: [{ label: 'Закрыть', variant: 'primary' }],
  });
}


function showWinModal(result) {
  openModal({
    title: 'Победа!',
    content: createWinContent(result),
    actions: [
      { label: 'Новая игра', icon: '🔄', variant: 'primary', onClick: startGame },
      { label: 'Закрыть', variant: 'ghost' },
    ],
  });
}


function finishGame() {
  gameState.isFinished = true;

  const saved = saveResult({ moves: gameState.moves, playedAt: Date.now() });

  winTimerId = setTimeout(() => {
    winTimerId = null;
    showWinModal({ moves: gameState.moves, position: saved.position });
  }, WIN_MODAL_DELAY);
}


function hideMismatchedCards(firstCard, secondCard) {
  mismatchTimerId = null;

  [firstCard, secondCard].forEach((card) => {
    card.isOpen = false;
    boardView.updateCard(card);
  });

  setBoardLocked(false);
}


function handleCardPick(uid) {
  if (gameState.isFinished || gameState.isLocked) {
    return;
  }

  const card = findCard(uid);

  if (!card || card.isOpen || card.isMatched) {
    return;
  }

  card.isOpen = true;
  boardView.updateCard(card);


  if (gameState.firstPickUid === null) {
    gameState.firstPickUid = card.uid;

    return;
  }

  const firstCard = findCard(gameState.firstPickUid);

  gameState.firstPickUid = null;


  gameState.moves += 1;
  updateCounters();

  if (firstCard.pairId === card.pairId) {
    firstCard.isMatched = true;
    card.isMatched = true;
    boardView.updateCard(firstCard);
    boardView.updateCard(card);

    gameState.pairsFound += 1;
    updateCounters();

    if (gameState.pairsFound === PAIRS_COUNT) {
      finishGame();
    }

    return;
  }

  // Пары нет, блокировка
  setBoardLocked(true);
  mismatchTimerId = setTimeout(() => hideMismatchedCards(firstCard, card), MISMATCH_DELAY);
}


function connectGameViews({ board, counters }) {
  boardView = board;
  countersView = counters;
}
