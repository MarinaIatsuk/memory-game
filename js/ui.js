'use strict';

 //Переиспользуемые компоненты интерфейса


function createHeader({ onNewGame, onShowLeaderboard }) {
  const brand = createElement('div', {
    className: 'header__brand',
    children: [
      createElement('span', {
        className: 'header__logo',
        text: '🧠',
        attrs: { 'aria-hidden': 'true' },
      }),
      createElement('div', {
        children: [
          createElement('h1', { className: 'header__title', text: 'Memory Game' }),
          createElement('p', {
            className: 'header__subtitle',
            text: 'Найдите все 8 пар за минимум ходов',
          }),
        ],
      }),
    ],
  });

  const actions = createElement('div', {
    className: 'header__actions',
    children: [
      createButton({
        label: 'Новая игра',
        icon: '🔄',
        variant: 'primary',
        onClick: onNewGame,
      }),
      createButton({
        label: 'Таблица лидеров',
        icon: '🏆',
        variant: 'ghost',
        onClick: onShowLeaderboard,
      }),
    ],
  });

  return createElement('header', {
    className: 'header',
    children: [brand, actions],
  });
}


function createCounters(totalPairs) {
  const movesValue = createElement('span', { className: 'counter__value', text: '0' });
  const pairsValue = createElement('span', {
    className: 'counter__value',
    text: `0 / ${totalPairs}`,
  });

  const element = createElement('section', {
    className: 'counters',
    attrs: {
      'aria-label': 'Счётчики игры',
      'aria-live': 'polite',
    },
    children: [
      createElement('div', {
        className: 'counter counter--moves',
        children: [
          createElement('span', { className: 'counter__label', text: 'Ходы' }),
          movesValue,
        ],
      }),
      createElement('div', {
        className: 'counter counter--pairs',
        children: [
          createElement('span', { className: 'counter__label', text: 'Найдено пар' }),
          pairsValue,
        ],
      }),
    ],
  });


  function update({ moves, pairsFound }) {
    movesValue.textContent = String(moves);
    pairsValue.textContent = `${pairsFound} / ${totalPairs}`;
  }

  return { element, update };
}


function getCardLabel(card) {
  if (card.isMatched) {
    return `${card.name}, пара найдена`;
  }

  if (card.isOpen) {
    return `${card.name}, карточка открыта`;
  }

  return 'Закрытая карточка';
}


function createCardElement(card, onPick) {
  const inner = createElement('span', {
    className: 'card__inner',
    children: [
      createElement('span', {
        className: 'card__face card__face--back',
        text: CARD_BACK_SYMBOL,
        attrs: { 'aria-hidden': 'true' },
      }),
      createElement('span', {
        className: 'card__face card__face--front',
        text: card.symbol,
        attrs: { 'aria-hidden': 'true' },
      }),
    ],
  });

  return createElement('button', {
    className: 'card',
    attrs: {
      type: 'button',
      'aria-label': getCardLabel(card),
    },
    dataset: { uid: card.uid },
    on: {
      click: () => onPick(card.uid),
    },
    children: inner,
  });
}


function updateCardElement(element, card) {
  element.classList.toggle('is-open', card.isOpen && !card.isMatched);
  element.classList.toggle('is-matched', card.isMatched);
  element.setAttribute('aria-label', getCardLabel(card));
  element.setAttribute('aria-disabled', String(card.isOpen || card.isMatched));
}


function createBoard({ onPick }) {
  const cardElements = new Map();
  const element = createElement('ul', {
    className: 'board',
    attrs: { 'aria-label': 'Игровое поле, 16 карточек' },
  });


  function render(cards) {
    clearElement(element);
    cardElements.clear();

    const fragment = document.createDocumentFragment();

    cards.forEach((card) => {
      const cardElement = createCardElement(card, onPick);

      cardElements.set(card.uid, cardElement);
      updateCardElement(cardElement, card);
      fragment.append(createElement('li', {
        className: 'board__cell',
        children: cardElement,
      }));
    });

    element.append(fragment);
  }


  function updateCard(card) {
    const cardElement = cardElements.get(card.uid);

    if (cardElement) {
      updateCardElement(cardElement, card);
    }
  }


  function setLocked(locked) {
    element.classList.toggle('is-locked', locked);
  }

  return { element, render, updateCard, setLocked };
}

