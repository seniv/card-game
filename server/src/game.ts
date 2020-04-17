import cards from './cards';
import { shuffle, minBy } from 'lodash';
import { randomKey } from './heplers';

import { Card, Player, PlaygroundSlot } from './interfaces';

class Game {
  id: number;
  cards: Array<Card>;
  players: Map<string, Player>;
  playground: Array<PlaygroundSlot>;
  started: boolean;
  trump: String;
  currentPlayer: string;
  moveTo: string;
  state: number;

  constructor () {
    this.id = Math.random()
    this.cards = shuffle(cards)
    this.players = new Map()
    this.playground = []
    this.started = false
    this.trump;
    this.currentPlayer
    this.moveTo
    this.state = 0
  }

  newPlayer (id: string) {
    this.players.set(id, {
      id: id,
      cards: [],
      move: 0 // 0 - not your move | 1 - your move | 2 - you must beat
    })
  }

  playerLeft (id: string) {
    this.players.delete(id)
  }

  startGame () {
    this.started = true
    this.trump = this.cards[0].suit
    
    this.giveCards()
    this.currentPlayer = this.__getPlayerWhoMoveFirst()
    this.players.get(this.currentPlayer).move = 1
    this.moveTo = this.nextPlayer(this.currentPlayer)
    this.players.get(this.moveTo).move = 2
    this.state = 1
  }

  addToPlayground (card: Card) {
    this.playground.push({
      placedCard: card,
      beatedCard: undefined,
    })
  }

  player (id: string) {
    return this.players.get(id)
  }

  nextPlayer (id: string) {
    let playersKeys = Array.from(this.players.keys())
    for (let i = 0; i < playersKeys.length; i++) {
      if (playersKeys[i] === id) {
        if (i + 1 >= playersKeys.length) {
          return playersKeys[0]
        } else {
          return playersKeys[i+1]
        }
      }
    }
  }

  get allPlayers () {
    return this.players
  }

  get playersCount () {
    return this.players.size
  }

  get isStarted () {
    return this.started
  }

  get gameInfo () {
    return {
      id: this.id,
      players: this.players.size,
      started: this.started
    }
  }

  get cardsLeft () {
    return this.cards.length
  }

  get getPlayground () {
    return this.playground
  }

  /* TODO: give cards first to player who just move */
  giveCards () {
    this.players.forEach((player, key) => {
      while(player.cards.length < 6 && this.cards.length) {
        const card = this.cards.pop()
        player.cards.push(card)
      }
    })
  }

  __getPlayerWhoMoveFirst () {
    const players = Array.from(this.players.values())
    const cards = players.reduce((accum, { cards, id }) => {
      const cardsWithPlayerId = cards.map(card => Object.assign({}, card, { playerId: id }))
      return accum.concat(cardsWithPlayerId)
    }, [])
    const filteredCards = cards.filter(card => card.suit === this.trump)
    return filteredCards.length
      ? minBy(filteredCards, ({ card }) => card).playerId
      : randomKey(this.players)
  }
}

export default Game;
