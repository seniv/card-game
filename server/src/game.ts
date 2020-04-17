import { shuffle, minBy } from 'lodash';
import cards from './cards';
import { randomKey } from './heplers';

import {
  Card, Player, PlaygroundSlot, GameInfo,
} from './interfaces';

class Game {
  id: number;
  cards: Array<Card>;
  players: Map<string, Player>;
  playground: Array<PlaygroundSlot>;
  started: boolean;
  trump: string;
  currentPlayer: string;
  moveTo: string;
  state: number;

  constructor() {
    this.id = Math.random();
    this.cards = shuffle(cards);
    this.players = new Map();
    this.playground = [];
    this.started = false;
    this.trump = undefined;
    this.currentPlayer = undefined;
    this.moveTo = undefined;
    this.state = 0;
  }

  newPlayer(id: string): void {
    this.players.set(id, {
      id,
      cards: [],
      move: 0, // 0 - not your move | 1 - your move | 2 - you must beat
    });
  }

  playerLeft(id: string): void {
    this.players.delete(id);
  }

  startGame(): void {
    this.started = true;
    this.trump = this.cards[0].suit;

    this.giveCards();
    this.currentPlayer = this.getPlayerWhoMoveFirst();
    this.players.get(this.currentPlayer).move = 1;
    this.moveTo = this.nextPlayer(this.currentPlayer);
    this.players.get(this.moveTo).move = 2;
    this.state = 1;
  }

  addToPlayground(card: Card): void {
    this.playground.push({
      placedCard: card,
      beatedCard: undefined,
    });
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
    const filteredCards = playersCards.filter((card) => card.suit === this.trump);
    return filteredCards.length
      ? minBy(filteredCards, ({ card }) => card).playerId
      : randomKey(this.players);
  }
}

export default Game;
