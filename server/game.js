const cards = require('./cards')
const { shuffle, minBy } = require('lodash')
const { randomKey } = require('./heplers')

module.exports = class Game {
  constructor () {
    this.id = Math.random()
    this.cards = shuffle(cards)
    this.players = new Map()
    this.playground = []
    this.started = false
    this.trump = false
    this.currentPlayer
    this.moveTo
    this.state = 0
  }

  newPlayer (id) {
    this.players.set(id, {
      id: id,
      cards: [],
      move: 0 // 0 - not your move | 1 - your move | 2 - you must beat
    })
  }

  playerLeft (id) {
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

  addToPlayground (card) {
    this.playground.push({
      placedCard: card,
      beatedCard: false
    })
  }

  player (id) {
    return this.players.get(id)
  }

  nextPlayer (id) {
    let array = Array.from(this.players.keys())
    for (let i = 0; i < array.length; i++) {
      if (array[i] === id) {
        if (i + 1 >= array.length) {
          return array[0]
        } else {
          return array[i+1]
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