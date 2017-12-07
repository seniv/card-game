const cards = require('./cards')
const shuffle = require('shuffle-array')
const cardWeight = require('./heplers').cardWeight

module.exports = class {
  constructor () {
    this.id = Math.random()
    this.cards = shuffle(cards, { copy: true })
    this.players = []
    this.playground = []
    this.started = false
    this.trump = false
  }

  newPlayer (id) {
    this.players.push({
      id: id,
      cards: [],
      move: 0 // 0 - not your move | 1 - your move | 2 - you must beat
    })
  }

  playerLeft (id) {
    this.players.find((item, i, array) => {
      if (item.id === id) {
        array.splice(i, 1)
        return true
      }
    })
  }

  startGame () {
    this.started = true
    this.trump = this.cards[0].mast

    this.__giveCardsFirsTime ()
  }

  get player (id) {
    return this.players.find(player => player.id === id)
  }

  get allPlayers () {
    return this.players
  }

  get players () {
    return this.players.length
  }

  get started () {
    return this.started
  }

  get gameInfo () {
    return {
      id: this.id,
      players: this.players.length,
      started: this.started
    }
  }

  __giveCardsFirsTime () {
    for (let i = 0; i < this.players.length; i++) {
    this.players[i].lessTrump = 100
  
      for (let x = 0; x < 6; x++) {
        let card = this.cards.pop()
        this.players[i].cards.push(card)
  
        if (card.mast === this.trump) {
          if (cardWeight(card.card) < this.players[i].lessTrump) {
            this.players[i].lessTrump = cardWeight(card.card)
          }
        }
      }
    }
  
    let playerWithLessTrump = -1
    let lessTrump = 100
    for (let i = 0; i < this.players.length; i++) {
      if (this.players[i].lessTrump < lessTrump) {
        lessTrump = players[i].lessTrump
        playerWithLessTrump = i
      }
      delete this.players[i].lessTrump
    }
    if (playerWithLessTrump !== -1) {
      this.players[playerWithLessTrump].move = 1
    } else {
      this.players[Math.round(Math.random()*players.length)].move = 1
    }
  }
}