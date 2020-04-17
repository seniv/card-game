import { MoveStates } from './enums';

export interface Card {
  card: number;
  suit: string;
}

export interface Player {
  id: string;
  cards: Array<Card>;
  moveState: MoveStates;
}

export interface PlaygroundSlot {
  placedCard: Card;
  beatedCard: Card;
}

export interface GameInfo {
  id: number;
  players: number;
  started: boolean;
}
