import { Socket } from 'socket.io';
import { MoveStates } from './enums';
import Game from './game';

export interface Card {
  id: number;
  value: number;
  suit: string;
}

export interface Player {
  id: string;
  cards: Map<number, Card>;
  moveState: MoveStates;
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

export interface GameData {
  game: Game;
  player: Player;
}

export interface GameSocket extends Socket {
  gameId: number;
  sendMessage(message: string): void;
  getGameData(): GameData;
}
