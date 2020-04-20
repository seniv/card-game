const cards = [
  { value: 1, suit: 'hearts' },
  { value: 1, suit: 'diams' },
  { value: 1, suit: 'spades' },
  { value: 1, suit: 'clubs' },

  { value: 2, suit: 'hearts' },
  { value: 2, suit: 'diams' },
  { value: 2, suit: 'spades' },
  { value: 2, suit: 'clubs' },

  { value: 3, suit: 'hearts' },
  { value: 3, suit: 'diams' },
  { value: 3, suit: 'spades' },
  { value: 3, suit: 'clubs' },

  { value: 4, suit: 'hearts' },
  { value: 4, suit: 'diams' },
  { value: 4, suit: 'spades' },
  { value: 4, suit: 'clubs' },

  { value: 5, suit: 'hearts' },
  { value: 5, suit: 'diams' },
  { value: 5, suit: 'spades' },
  { value: 5, suit: 'clubs' },

  { value: 6, suit: 'hearts' },
  { value: 6, suit: 'diams' },
  { value: 6, suit: 'spades' },
  { value: 6, suit: 'clubs' },

  { value: 7, suit: 'hearts' },
  { value: 7, suit: 'diams' },
  { value: 7, suit: 'spades' },
  { value: 7, suit: 'clubs' },

  { value: 8, suit: 'hearts' },
  { value: 8, suit: 'diams' },
  { value: 8, suit: 'spades' },
  { value: 8, suit: 'clubs' },

  { value: 9, suit: 'hearts' },
  { value: 9, suit: 'diams' },
  { value: 9, suit: 'spades' },
  { value: 9, suit: 'clubs' },
];

export default cards.map((card, index) => ({ ...card, id: index }));
