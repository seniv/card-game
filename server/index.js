const io = require('socket.io')(8090)
const shuffle = require('shuffle-array')

const cards = require('./cards')

let games = new Map()

io.on('connection', (socket) => {
  socket.on('getGames', () => {
    socket.emit('gamesList', gamesList())
  })
  socket.on('createGame', () => {
    if (socket.gameId) return false
    let gameId = Math.random()
    games.set(gameId, {
      cards: shuffle(cards, {
        copy: true
      }),
      players: [{
        id: socket.id,
        cards: [],
        move: 0 // 0 - not your move | 1 - your move | 2 - you must beat
      }],
      playground: [],
      started: false,
      trump: false
    })
    socket.join('game' + gameId)
    socket.gameId = gameId
    socket.emit('gameCreated', gameId)
    console.log('game id', gameId, 'created')
  })
  socket.on('connectToGame', (id) => {
    if (socket.gameId) return false
    if (!games.has(id)) return socket.emit('message', 'game not found')
    if (games.get(id).started) return socket.emit('message', 'you cant connect to started game')
    console.log('user', socket.id, 'connected to game', id)
    games.get(id).players.push({
      id: socket.id,
      cards: [],
      move: 0
    })
    socket.emit('message', 'connected to game')
  })
  socket.on('startGame', () => {
    if (!socket.gameId || !games.has(socket.gameId) || games.get(socket.gameId).started) return false
    if (games.get(socket.gameId).players.length < 1) {
      socket.emit('message', 'cant start game if players less then two')
      return
    }
    console.log('game', socket.gameId, 'was started')

    games.get(socket.gameId).started = true
    games.get(socket.gameId).trump = games.get(socket.gameId).cards[0].mast;

    giveCardsFirstTime(socket.gameId)
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

function makeMove(socket, card) {
  card = card.split(':')
  let game = games.get(socket.gameId)
  let player = game.players.find(item => item.id === socket.id)
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
  let players = games.get(id).players
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

function giveCardsFirstTime(id) {
  let players = games.get(id).players
  for (let i = 0; i < players.length; i++) {
    players[i].lessTrump = 100

    for (let x = 0; x < 6; x++) {
      let card = games.get(id).cards.pop()
      players[i].cards.push(card)

      if (card.mast === games.get(id).trump) {
        if (cardWeight(card.card) < players[i].lessTrump) {
          players[i].lessTrump = cardWeight(card.card)
        }
      }
    }
  }

  let playerWithLessTrump = -1
  let lessTrump = 100
  for (let i = 0; i < players.length; i++) {
    if (players[i].lessTrump < lessTrump) {
      lessTrump = players[i].lessTrump
      playerWithLessTrump = i
    }
    delete players[i].lessTrump
  }
  if (playerWithLessTrump !== -1) {
    players[playerWithLessTrump].move = 1
  } else {
    players[Math.round(Math.random()*players.length)].move = 1
  }
  console.log(players)
}

function gamesList() {
  let gam = []
  games.forEach((value, key) => {
    gam.push({
      id: key,
      players: value.players.length,
      started: value.started
    })
  })
  return gam
}

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