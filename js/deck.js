'use strict';

const CARD_SET = [
  { id: 'peacock', symbol: '🦚', name: 'Павлин' },
  { id: 'penguin', symbol: '🐧', name: 'Пингвин' },
  { id: 'butterfly', symbol: '🦋', name: 'Бабочка' },
  { id: 'octopus', symbol: '🐙', name: 'Осьминог' },
  { id: 'unicorn', symbol: '🦄', name: 'Единорог' },
  { id: 'bee', symbol: '🐝', name: 'Пчела' },
  { id: 'whale', symbol: '🐳', name: 'Кит' },
  { id: 'tiger', symbol: '🐯', name: 'Тигр' },
];


const CARD_BACK_SYMBOL = '❓';


const PAIRS_COUNT = CARD_SET.length;


const CARDS_COUNT = PAIRS_COUNT * 2;

function shuffleArray(items) {
  const result = [...items];

  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));

    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

function createDeck() {
  const deck = [];

  CARD_SET.forEach((cardData) => {
    for (let copy = 1; copy <= 2; copy += 1) {
      deck.push({
        uid: `${cardData.id}-${copy}`,
        pairId: cardData.id,
        symbol: cardData.symbol,
        name: cardData.name,
        isOpen: false,
        isMatched: false,
      });
    }
  });

  return shuffleArray(deck);
}
