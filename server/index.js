const io = require('socket.io')(8090)

const Game = require('./game')
const cardWeight = require('./heplers').cardWeight
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
    socket.emit('gameCreated', game.id)
    console.log('game id', game.id, 'created')
  })

  socket.on('connectToGame', (id) => {
    if (socket.gameId) return false
    if (!games.has(id)) return socket.emit('message', 'game not found')
    if (games.get(id).started) return socket.emit('message', 'you cant connect to started game')

    console.log('user', socket.id, 'connected to game', id)
    games.get(id).newPlayer(socket.id)
    socket.emit('message', 'connected to game')
  })

  socket.on('startGame', () => {
    if (!socket.gameId || !games.has(socket.gameId) || games.get(socket.gameId).started) return false
    if (games.get(socket.gameId).players < 1) {
      socket.emit('message', 'cant start game if players less then two')
      return
    }
    console.log('game', socket.gameId, 'was started')

    games.get(socket.gameId).startGame()
    updateGame(socket.gameId)
  })

  socket.on('makeMove', (card) => {
    if (!socket.gameId || !games.has(socket.gameId)) return false
    makeMove(socket, card)
  })

  socket.on('leaveGame', () => {
    if (!socket.gameId || !games.has(socket.gameId)) return false
    console.log('user', socket.id, 'leave game', socket.gameId)
    games.get(socket.gameId).players.find((item, i, array) => {
      if (item.id === socket.id) {
        array.splice(i, 1)
        return true
      }
    })
    if (games.get(socket.gameId).players.length < 1) {
      games.delete(socket.gameId)
      console.log('game with id', socket.gameId, 'was deleted')
    }
    delete socket.gameId
  })

  socket.on('disconnect', () => {
    console.log('user', socket.id, 'disconected')
    if (socket.gameId && games.has(socket.gameId)) {
      games.get(socket.gameId).playerLeft(socket.id)
      if (games.get(socket.gameId).players < 1) {
        games.delete(socket.gameId)
        console.log('game with id', socket.gameId, 'was deleted')
      }
    }
  })
})

function makeMove(socket, card) {
  card = card.split(':')
  let game = games.get(socket.gameId)
  let player = game.player(socket.id)
  if (!player.cards.find(item => item.card === card[0] && item.mast === card[1])) return socket.emit('message', 'your dont have this card O_o')
  switch (player.move) {
    case 1:
      card = player.cards.find((item, index, array) => {
        if(item.card === card[0] && item.mast === card[1]) {
          array.splice(index, 1)
          return true
        }
      })
      game.playground.push({
        placedCard: card,
        beatedCard: false
      })
      player.move = 0
      updateGame(socket.gameId)
      break
    default: return socket.emit('message', 'your cant move!')
  }
}

function updateGame(id) {
  let players = games.get(id).allPlayers
  for (let i = 0; i < players.length; i++) {
    io.to(players[i].id).emit('gameUpdate', {
      cardsLeft: games.get(id).cards.length,
      cards: players[i].cards,
      trump: games.get(id).cards[0],
      yourMove: players[i].move,
      playground: games.get(id).playground
    })
  }
}

function gamesList() {
  let gam = []
  games.forEach((value, key) => {
    gam.push(value.gameInfo)
  })
  return gam
}
