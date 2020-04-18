import { shuffle, minBy, head } from 'lodash';
import cards from './cards';
import { randomKey } from './heplers';

import {
  Card, Player, PlaygroundSlot, GameInfo,
} from './interfaces';
import { MoveStates } from './enums';

class Game {
  public readonly id: number;
  private readonly cards: Array<Card>;
  private readonly players: Map<string, Player>;
  private playground: Array<PlaygroundSlot>;
  private started: boolean;
  public readonly trumpCard: Card;
  public currentPlayerId: string;
  public moveToPlayerId: string;
  public moveState: MoveStates;

  constructor() {
    this.id = Math.random();
    this.cards = shuffle(cards);
    this.players = new Map();
    this.playground = [];
    this.started = false;
    this.trumpCard = head(this.cards);
    this.currentPlayerId = undefined;
    this.moveToPlayerId = undefined;
    this.moveState = MoveStates.NONE;
  }

  newPlayer(id: string): void {
    this.players.set(id, {
      id,
      cards: [],
      moveState: MoveStates.NONE, // 0 - not your move | 1 - your move | 2 - you must beat
    });
  }

  playerLeft(id: string): void {
    this.players.delete(id);
  }

  startGame(): void {
    this.started = true;

    this.giveCards();

    this.currentPlayerId = this.getPlayerWhoMoveFirst();
    this.players.get(this.currentPlayerId).moveState = MoveStates.MOVE;

    this.moveToPlayerId = this.nextPlayer(this.currentPlayerId);
    this.players.get(this.moveToPlayerId).moveState = MoveStates.BEAT;

    this.moveState = MoveStates.MOVE;
  }

  moveToNextPlayers(): void {
    this.currentPlayerId = this.nextPlayer(this.currentPlayerId);
    this.players.get(this.currentPlayerId).moveState = MoveStates.MOVE;

    this.moveToPlayerId = this.nextPlayer(this.currentPlayerId);
    this.players.get(this.moveToPlayerId).moveState = MoveStates.BEAT;
  }

  addToPlayground(card: Card): void {
    this.playground.push({
      placedCard: card,
      beatedCard: undefined,
    });
  }

  clearPlayground(): void {
    this.playground = [];
  }

  player(id: string): Player {
    return this.players.get(id);
  }

  nextPlayer(id: string): string {
    const playersKeys = Array.from(this.players.keys());
    for (let i = 0; i < playersKeys.length; i++) {
      if (playersKeys[i] === id) {
        if (i + 1 >= playersKeys.length) {
          return playersKeys[0];
        }
        return playersKeys[i + 1];
      }
    }
  }

  get allPlayers(): Map<string, Player> {
    return this.players;
  }

  get playersCount(): number {
    return this.players.size;
  }

  get isStarted(): boolean {
    return this.started;
  }

  get gameInfo(): GameInfo {
    return {
      id: this.id,
      players: this.players.size,
      started: this.started,
    };
  }

  get cardsLeft(): number {
    return this.cards.length;
  }

  get getPlayground(): Array<PlaygroundSlot> {
    return this.playground;
  }

  /* TODO: give cards first to player who just move */
  giveCards(): void {
    this.players.forEach((player) => {
      while (player.cards.length < 6 && this.cards.length) {
        const card = this.cards.pop();
        player.cards.push(card);
      }
    });
  }

  private getPlayerWhoMoveFirst(): string {
    const players = Array.from(this.players.values());
    const playersCards = players.reduce((accum, { cards: playerCards, id }) => {
      const cardsWithPlayerId = playerCards.map((card) => ({ ...card, playerId: id }));
      return accum.concat(cardsWithPlayerId);
    }, []);
    const filteredCards = playersCards.filter((card) => card.suit === this.trumpCard.suit);
    return filteredCards.length
      ? minBy(filteredCards, ({ card }) => card).playerId
      : randomKey(this.players);
  }
}

export default Game;
