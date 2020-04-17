export interface Card {
  card: number;
  suit: string;
}

export interface Player {
  id: string;
  cards: Array<Card>;
  move: number;
}

export interface PlaygroundSlot {
  placedCard: Card;
  beatedCard: Card;
}
