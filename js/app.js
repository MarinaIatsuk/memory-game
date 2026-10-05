'use strict';

function initApp() {
  const header = createHeader({
    onNewGame: restartGame,
    onShowLeaderboard: showLeaderboardModal,
  });

  const counters = createCounters(PAIRS_COUNT);
  const board = createBoard({ onPick: handleCardPick });

  const main = createElement('main', {
    className: 'main',
    children: [counters.element, board.element],
  });

  const footer = createElement('footer', {
    className: 'footer',
    children: createElement('p', {
      text: 'Memory Game  RS School',
    }),
  });

  const app = createElement('div', {
    className: 'app',
    children: [header, main, footer],
  });

  appendChildren(document.body, app);
  connectGameViews({ board, counters });
  startGame();
}

initApp();
