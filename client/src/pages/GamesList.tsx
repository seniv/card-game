import React from 'react';
import { socket } from '../socket';

interface GameInfo {
  id: number;
  players: number;
  started: boolean;
}

interface State {
  gamesList: Array<GameInfo>;
}

interface Props {
  setGameId: Function;
}

class GamesList extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      gamesList: [],
    };

    this.onGamesList = this.onGamesList.bind(this);
    this.onGameIsReady = this.onGameIsReady.bind(this);
  }

  componentDidMount() {
    socket.on('gamesList', this.onGamesList);
    socket.on('gameIsReady', this.onGameIsReady);
  }

  componentWillUnmount() {
    socket.removeListener('gamesList', this.onGamesList);
    socket.removeListener('gameIsReady', this.onGameIsReady);
  }

  onGamesList(gamesList: Array<GameInfo>) {
    this.setState({ gamesList });
  }

  onGameIsReady(id: number) {
    const { setGameId } = this.props;
    setGameId(id);
  }

  joinGame = (game: GameInfo) => {
    socket.emit('connectToGame', game.id);
  }

  createGame = () => {
    socket.emit('createGame');
  }

  render() {
    const { gamesList } = this.state;
    return (
      <div className="index">
        <ul className="games-list">
          {gamesList.map((game) => (
            <li key={game.id} onClick={() => this.joinGame(game)}>
              <span>{game.id}</span>
              <span>{game.players}</span>
              <span>{game.started}</span>
            </li>
          ))}
        </ul>
        <button type="button" onClick={this.createGame}>Create new Game</button>
      </div>
    );
  }
}

export default GamesList;
