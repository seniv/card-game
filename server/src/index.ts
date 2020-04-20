import * as IO from 'socket.io';
import { isEqual, uniqWith } from 'lodash';

import Game from './game';
import {
  Card, GameInfo, GameSocket, GameData,
} from './interfaces';
import { MoveStates } from './enums';

const PORT = 8090;
const io = IO(PORT);
console.log(`Server started on port ${PORT}`);

const games: Map<number, Game> = new Map();

function updateGame(id: number): void {
  const game = games.get(id);
  if (!game) return;

  game.allPlayers.forEach((player, key) => {
    console.log('update game', id, player);
    io.to(key).emit('gameUpdate', {
      cardsLeft: game.cardsLeft,
      cards: player.cards,
      trump: game.trumpCard,
      yourMove: player.moveState,
      playground: game.getPlayground,
      isGameStarted: game.isStarted,
    });
  });
}

function makeMove(
  socket: GameSocket,
  { cards, cardToBeat }: { cards: Array<Card>; cardToBeat: Card },
): void {
  cards = uniqWith(cards, isEqual);

  const { game, player } = socket.getGameData();
  const isTrump = ({ suit }: Card): boolean => suit === game.trumpCard.suit;
  const getCardIndex = (card: Card): number => player.cards.findIndex(
    (item) => isEqual(item, card),
  );

  if (player.moveState !== game.moveState) {
    socket.sendMessage('now is not your move!');
    return;
  }

  const haveCards = cards.every(
    (card) => player.cards.some((playerCard) => isEqual(playerCard, card)),
  );

  if (!haveCards) {
    socket.sendMessage('You don\'t have this card(s) O_o');
    return;
  }

  switch (player.moveState) {
    case MoveStates.MOVE: {
      cards.forEach((card) => {
        const cardIndex = getCardIndex(card);
        player.cards.splice(cardIndex, 1);
        game.addToPlayground(card);
      });

      player.moveState = MoveStates.NONE;
      game.moveState = MoveStates.BEAT;
      updateGame(game.id);
      break;
    }
    case MoveStates.BEAT: {
      if (cards.length > 1) {
        socket.sendMessage('You can bead only one card at once');
        return;
      }

      const [card] = cards;
      const playground = game.getPlayground;
      const pgIndex = playground.findIndex((item) => isEqual(item.placedCard, cardToBeat));
      if (pgIndex === -1) {
        socket.sendMessage('card not valid');
        return;
      }
      if (playground[pgIndex].beatedCard) {
        socket.sendMessage('this card already beaten');
        return;
      }

      if (isTrump(card)) {
        if (isTrump(cardToBeat) && card.card < cardToBeat.card) {
          socket.sendMessage('your card can not be less');
          return;
        }
      } else {
        if (card.suit !== cardToBeat.suit) {
          socket.sendMessage('card must have same suit');
          return;
        }
        if (card.card < cardToBeat.card) {
          socket.sendMessage('your card can not be less');
          return;
        }
      }

      const cardIndex = getCardIndex(card);
      player.cards.splice(cardIndex, 1);

      game.getPlayground[pgIndex].beatedCard = card;
      if (game.getPlayground.some(({ beatedCard }) => !beatedCard)) {
        updateGame(game.id);
        return;
      }

      player.moveState = MoveStates.NONE;

      game.clearPlayground();
      game.moveToNextPlayers();
      game.giveCards();
      game.moveState = MoveStates.MOVE;

      updateGame(game.id);
      break;
    }
    default: {
      socket.sendMessage('you cant move!');
    }
  }
}

function gamesList(): Array<GameInfo> {
  return Array.from(games.values(), (game) => game.gameInfo);
}

function updateGamesList(): void {
  io.emit('gamesList', gamesList());
}

io.on('connection', (socket: GameSocket) => {
  socket.sendMessage = (message): void => {
    socket.emit('message', message);
  };
  socket.getGameData = (): GameData => {
    const game = games.get(socket.gameId);
    if (!game) {
      return { game: null, player: null };
    }
    return {
      game,
      player: game.allPlayers.get(socket.id),
    };
  };

  socket.on('getGames', () => {
    socket.emit('gamesList', gamesList());
  });

  socket.on('createGame', () => {
    if (socket.gameId) return false;

    const game = new Game();

    games.set(game.id, game);
    game.newPlayer(socket.id);

    socket.join(`game${game.id}`);
    socket.gameId = game.id;
    socket.emit('gameIsReady', game.id);
    console.log('game id', game.id, 'created');

    updateGamesList();
  });

  socket.on('connectToGame', (id) => {
    if (socket.gameId) return false;
    if (!games.has(id)) return socket.sendMessage('game not found');
    if (games.get(id).isStarted) return socket.sendMessage('you cant connect to started game');

    console.log('user', socket.id, 'connected to game', id);
    games.get(id).newPlayer(socket.id);
    socket.join(`game${id}`);
    socket.gameId = id;
    socket.emit('gameIsReady', id);

    updateGamesList();
  });

  socket.on('startGame', () => {
    if (!socket.gameId || !games.has(socket.gameId) || games.get(socket.gameId).isStarted) {
      return false;
    }

    if (games.get(socket.gameId).playersCount < 2) {
      socket.sendMessage('cant start game if players less then two');
      return;
    }
    console.log('game', socket.gameId, 'was started');

    games.get(socket.gameId).startGame();
    updateGame(socket.gameId);

    updateGamesList();
  });

  socket.on('makeMove', (data) => {
    if (!socket.gameId || !games.has(socket.gameId)) return false;

    makeMove(socket, data);
  });

  socket.on('takeCards', () => {
    const { game, player } = socket.getGameData();
    if (!game || game.moveState !== MoveStates.BEAT || player.moveState !== game.moveState) {
      socket.sendMessage('You can\'t do this right now');
      return;
    }
    game.takeCards(player.id);

    do {
      game.moveToNextPlayers();
    } while (game.currentPlayerId === player.id && game.playersCount > 1);

    game.giveCards();

    game.moveState = MoveStates.MOVE;

    updateGame(game.id);
  });

  socket.on('leaveGame', () => {
    if (!socket.gameId || !games.has(socket.gameId)) return false;

    console.log('user', socket.id, 'leave game', socket.gameId);
    games.get(socket.gameId).playerLeft(socket.id);

    if (games.get(socket.gameId).playersCount < 1) {
      games.delete(socket.gameId);
      console.log('game with id', socket.gameId, 'was deleted');
    }
    delete socket.gameId;

    updateGamesList();
  });

  socket.on('disconnect', () => {
    console.log('user', socket.id, 'disconnected');

    if (socket.gameId && games.has(socket.gameId)) {
      games.get(socket.gameId).playerLeft(socket.id);

      if (games.get(socket.gameId).playersCount < 1) {
        games.delete(socket.gameId);
        console.log('game with id', socket.gameId, 'was deleted');
      }
    }

    updateGamesList();
  });
});
