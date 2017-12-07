const cards = require('./cards')
const shuffle = require('shuffle-array')
const cardWeight = require('./heplers').cardWeight
const randomKey = require('./heplers').randomKey

module.exports = class Game {
  constructor () {
    this.id = Math.random()
    this.cards = shuffle(cards, { copy: true })
    this.players = new Map()
    this.playground = []
    this.started = false
    this.trump = false
    this.currentPlayer
    this.moveTo
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
    this.trump = this.cards[0].mast

    this.__giveCardsFirsTime ()
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

  __giveCardsFirsTime () {
    this.players.forEach((player, key) => {
      player.lessTrump = 100

      for (let x = 0; x < 6; x++) {
        let card = this.cards.pop()
        player.cards.push(card)
  
        if (card.mast === this.trump) {
          if (cardWeight(card.card) < player.lessTrump) {
            player.lessTrump = cardWeight(card.card)
          }
        }
      }
    })

    let playerWithLessTrump = -1
    let lessTrump = 100
    this.players.forEach((player, key) => {
      if (player.lessTrump < lessTrump) {
        lessTrump = player.lessTrump
        playerWithLessTrump = key
      }
      delete this.player.lessTrump
    })
    if (playerWithLessTrump === -1) {
      playerWithLessTrump = randomKey(this.players)
    }
    this.currentPlayer = playerWithLessTrump
    this.players.get(this.currentPlayer).move = 1
    this.moveTo = this.nextPlayer(this.currentPlayer)
    this.players.get(this.moveTo).move = 2
  }
}