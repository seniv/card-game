const io = require('socket.io')(8090)
const _ = require('lodash')

const Game = require('./game')
const games = new Map()

io.on('connection', (socket) => {
  socket.on('getGames', () => {
    socket.emit('gamesList', gamesList())
  })

  socket.on('createGame', () => {
    if (socket.gameId) return false

    let game = new Game()

    games.set(game.id, game)
    game.newPlayer(socket.id)

    socket.join('game' + game.id)
    socket.gameId = game.id
    socket.emit('gameIsReady', game.id)
    console.log('game id', game.id, 'created')
  })
  
  socket.on('connectToGame', (id) => {
    if (socket.gameId) return false
    if (!games.has(id)) return socket.emit('message', 'game not found')
    if (games.get(id).isStarted) return socket.emit('message', 'you cant connect to started game')
    
    console.log('user', socket.id, 'connected to game', id)
    games.get(id).newPlayer(socket.id)
    socket.join('game' + id)
    socket.gameId = id
    socket.emit('gameIsReady', id)
  })

  socket.on('startGame', () => {
    if (!socket.gameId || !games.has(socket.gameId) || games.get(socket.gameId).isStarted) return false
    if (games.get(socket.gameId).playersCount < 2) {
      socket.emit('message', 'cant start game if players less then two')
      return
    }
    console.log('game', socket.gameId, 'was started')

    games.get(socket.gameId).startGame()
    updateGame(socket.gameId)
  })

  socket.on('makeMove', (data) => {
    if (!socket.gameId || !games.has(socket.gameId)) return false

    makeMove(socket, data)
  })

  socket.on('leaveGame', () => {
    if (!socket.gameId || !games.has(socket.gameId)) return false

    console.log('user', socket.id, 'leave game', socket.gameId)
    games.get(socket.gameId).playerLeft(socket.id)

    if (games.get(socket.gameId).playersCount < 1) {
      games.delete(socket.gameId)
      console.log('game with id', socket.gameId, 'was deleted')
    }
    delete socket.gameId
  })

  socket.on('disconnect', () => {
    console.log('user', socket.id, 'disconected')

    if (socket.gameId && games.has(socket.gameId)) {
      games.get(socket.gameId).playerLeft(socket.id)

      if (games.get(socket.gameId).playersCount < 1) {
        games.delete(socket.gameId)
        console.log('game with id', socket.gameId, 'was deleted')
      }
    }
  })
})

function makeMove(socket, { card, cardToBeat }) {
  const game = games.get(socket.gameId)
  const player = game.player(socket.id)
  if (player.move !== game.state) {
    return socket.emit('message', 'now is not your move!')
  }
  const cardIndex = _.findIndex(player.cards, item => _.isEqual(item, card))
  if (cardIndex === -1) {
    return socket.emit('message', 'you dont have this card O_o')
  }
  switch (player.move) {
    case 1:
      player.cards.splice(cardIndex, 1)
      
      game.addToPlayground(card)
      player.move = 0
      game.state = 2
      updateGame(socket.gameId)
      break
    case 2:
      const playground = game.getPlayground
      const pgIndex = _.findIndex(playground, item => _.isEqual(item.placedCard, cardToBeat))
      if (pgIndex === -1) return socket.emit('message', 'card not valid')
      if (playground[pgIndex].beatedCard) return socket.emit('message', 'this card already beaten')

      const isTrump = ({suit}) => suit === game.trump
      if (isTrump(card)) {
        if (isTrump(cardToBeat) && card.card < cardToBeat.card) {
          return socket.emit('message', 'your card can not be less')
        }
      } else {
        if (card.suit !== cardToBeat.suit) return socket.emit('message', 'card must have same suit')
        if (card.card < cardToBeat.card) {
          return socket.emit('message', 'your card can not be less')
        }
      }
      player.cards.splice(cardIndex, 1)
      
      game.getPlayground[pgIndex].beatedCard = card
      player.move = 0
      updateGame(socket.gameId)
      break
    default: return socket.emit('message', 'you cant move!')
  }
}

function updateGame(id) {
  games.get(id).allPlayers.forEach((player, key) => {
    io.to(key).emit('gameUpdate', {
      cardsLeft: games.get(id).cardsLeft,
      cards: player.cards,
      trump: games.get(id).cards[0],
      yourMove: player.move,
      playground: games.get(id).getPlayground
    })
  })
}

function gamesList() {
  return Array.from(games.values(), game => game.gameInfo)
}
