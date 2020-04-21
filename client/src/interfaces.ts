export enum MoveStates {
  NONE = 0,
  MOVE = 1,
  BEAT = 2,
}

export interface Card {
  id: number;
  value: number;
  suit: string;
}

export interface PlaygroundSlot {
  placedCard: Card;
  beatenCard: Card;
}

export interface GameInfo {
  id: number;
  players: number;
  started: boolean;
}

export interface GameUpdate {
  cardsLeft: number;
  cards: Array<Card>;
  trump: Card;
  yourMove: MoveStates;
  playground: Array<PlaygroundSlot>;
  isGameStarted: boolean;
}
