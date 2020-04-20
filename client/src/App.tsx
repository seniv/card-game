import React, { useState } from 'react';
import styled from 'styled-components';

import GamesList from './pages/GamesList';
import Game from './pages/Game';

const AppContainer = styled.div`
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  width: 800px;
  height: 800px;
  background-color: #eeeeee;
  box-sizing: border-box;
  margin: auto;
  margin-top: 60px;
`;

function App() {
  const [gameId, setGameId] = useState(0);

  return (
    <AppContainer>
      {gameId ? (
        <Game id={gameId} />
      ) : (
        <GamesList setGameId={setGameId} />
      )}
    </AppContainer>
  );
}

export default App;
