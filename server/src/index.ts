import * as IO from 'socket.io';
import { uniq } from 'lodash';

import Game from './game';
import {
  Card, GameInfo, GameSocket, GameData,
} from './interfaces';
import { MoveStates } from './enums';
import { mapToArray, allHaveSameValue } from './helpers';

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
      cards: mapToArray(player.cards),
      trump: game.trumpCard,
      yourMove: player.moveState,
      playground: game.playground,
      isGameStarted: game.isStarted,
    });
  });
}

function makeMove(
  socket: GameSocket,
  { cardIds, cardIdToBeat }: { cardIds: Array<number>; cardIdToBeat: number },
): void {
  const { game, player } = socket.getGameData();
  const isTrump = ({ suit }: Card): boolean => suit === game.trumpCard.suit;

  if (player.moveState !== game.moveState) {
    socket.sendMessage('now is not your move!');
    return;
  }

  const cards = uniq(cardIds).map((cardId) => player.cards.get(cardId));
  const haveCards = cards.every((card) => !!card);
  if (!haveCards) {
    socket.sendMessage('You don\'t have this card(s) O_o');
    return;
  }

  switch (player.moveState) {
    case MoveStates.MOVE: {
      if (!allHaveSameValue(cards)) {
        socket.sendMessage('Cards should have same value!');
        return;
      }
      cards.forEach((card) => {
        player.cards.delete(card.id);
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
      const pgIndex = game.playground.findIndex((item) => item.placedCard.id === cardIdToBeat);
      const cardToBeat = game.playground[pgIndex]?.placedCard;
      if (pgIndex === -1) {
        socket.sendMessage('card not valid');
        return;
      }
      if (game.playground[pgIndex].beatenCard) {
        socket.sendMessage('this card already beaten');
        return;
      }

      if (isTrump(card)) {
        if (isTrump(cardToBeat) && card.value < cardToBeat.value) {
          socket.sendMessage('your card value can not be less');
          return;
        }
      } else {
        if (card.suit !== cardToBeat.suit) {
          socket.sendMessage('card must have same suit');
          return;
        }
        if (card.value < cardToBeat.value) {
          socket.sendMessage('your card value can not be less');
          return;
        }
      }

      player.cards.delete(card.id);

      game.playground[pgIndex].beatenCard = card;
      if (game.playground.some(({ beatenCard }) => !beatenCard)) {
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
