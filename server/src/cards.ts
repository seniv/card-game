const cards = [
  { card: 1, suit: 'hearts' },
  { card: 1, suit: 'diams' },
  { card: 1, suit: 'spades' },
  { card: 1, suit: 'clubs' },

  { card: 2, suit: 'hearts' },
  { card: 2, suit: 'diams' },
  { card: 2, suit: 'spades' },
  { card: 2, suit: 'clubs' },

  { card: 3, suit: 'hearts' },
  { card: 3, suit: 'diams' },
  { card: 3, suit: 'spades' },
  { card: 3, suit: 'clubs' },

  { card: 4, suit: 'hearts' },
  { card: 4, suit: 'diams' },
  { card: 4, suit: 'spades' },
  { card: 4, suit: 'clubs' },

  { card: 5, suit: 'hearts' },
  { card: 5, suit: 'diams' },
  { card: 5, suit: 'spades' },
  { card: 5, suit: 'clubs' },

  { card: 6, suit: 'hearts' },
  { card: 6, suit: 'diams' },
  { card: 6, suit: 'spades' },
  { card: 6, suit: 'clubs' },

  { card: 7, suit: 'hearts' },
  { card: 7, suit: 'diams' },
  { card: 7, suit: 'spades' },
  { card: 7, suit: 'clubs' },

  { card: 8, suit: 'hearts' },
  { card: 8, suit: 'diams' },
  { card: 8, suit: 'spades' },
  { card: 8, suit: 'clubs' },

  { card: 9, suit: 'hearts' },
  { card: 9, suit: 'diams' },
  { card: 9, suit: 'spades' },
  { card: 9, suit: 'clubs' },
];

export default cards.map((card, index) => ({ ...card, id: index }));
