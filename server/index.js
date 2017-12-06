const io = require('socket.io')(8090)
const shuffle = require('shuffle-array')

const cards = require('./cards')

let games = new Map()

io.on('connection', function (socket) {
  socket.on('createGame', function () {
    if (socket.gameId) return false
    let gameId = Math.random()
    games.set(gameId, {
      cards: shuffle(cards, {
        copy: true
      }),
      players: [{
        id: socket.id,
        cards: []
      }],
      playground: [],
      started: false,
      cozur: false
    })
    socket.join('game' + gameId)
    socket.gameId = gameId
    console.log('game id', gameId, 'created')
  })
  socket.on('connectToGame', function (id) {
    if (socket.gameId) return false
    if (!games.has(id)) return socket.emit('message', 'game not found')
    console.log('user', socket.id, 'connected to game', id)
    games.get(id).players.push({
      id: socket.id,
      cards: []
    })
    socket.emit('message', 'connected to game')
  })
  socket.on('startGame', function () {
    if (!socket.gameId || !games.has(socket.gameId) || games.get(socket.gameId).started) return false
    if (games.get(socket.gameId).players.length < 1) {
      socket.emit('message', 'cant start game if players less then two')
      return
    }
    console.log('game', socket.gameId, 'was started')

    games.get(socket.gameId).started = true
    games.get(socket.gameId).cozur = games.get(socket.gameId).cards[0].mast;
    let players = games.get(socket.gameId).players
    for (let i = 0; i < players.length; i++) {
      for (let x = 0; x < 6; x++) {
        players[i].cards.push(games.get(socket.gameId).cards.pop())
      }
      players[i].lessKozur = 100
      for (let x = 0; x < players[i].cards.length; x++) {
        let card = players[i].cards[x]
        if (card.mast === games.get(socket.gameId).cozur) {
          if (cardWeight(card.card) < players[i].lessKozur) {
            players[i].lessKozur = cardWeight(card.card)
          }
        }
      }
    }
    // TODO: make firt move
    for (let i = 0; i < players.length; i++) {
      
      io.to(players[i].id).emit('gameUpdate', {
        cardsLeft: games.get(socket.gameId).cards.length,
        cards: players[i].cards,
        cozur: games.get(socket.gameId).cards[0]
      })
    }
  })
  socket.on('leaveGame', function () {
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
  socket.on('disconnect', function () {
    console.log('user', socket.id, 'disconected')
    if (socket.gameId && games.has(socket.gameId)) {
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
    }
  })
})

function cardWeight (card) {
  switch (card) {
    case '6': return 1
    case '7': return 2
    case '8': return 3
    case '9': return 4
    case '10': return 5
    case 'j': return 6
    case 'q': return 7
    case 'k': return 8
    case 'a': return 9
    default: return 0
  }
}