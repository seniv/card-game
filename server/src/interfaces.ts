import { Socket } from 'socket.io';
import { MoveStates } from './enums';
import Game from './game';

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

export interface GameData {
  game: Game;
  player: Player;
}

export interface GameSocket extends Socket {
  gameId: number;
  sendMessage(message: string): void;
  getGameData(): GameData;
}
