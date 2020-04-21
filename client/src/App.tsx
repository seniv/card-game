import React, { useState } from 'react';
import styled, { createGlobalStyle } from 'styled-components';

import GamesList from './pages/GamesList';
import Game from './pages/Game';

const GlobalStyle = createGlobalStyle`
  h1, h2 {
    font-weight: normal;
  }
  ul {
    list-style-type: none;
    padding: 10px;
    margin: 0;
  }
  a {
    color: #42b983;
  }
`;

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
      <GlobalStyle />
      {gameId ? (
        <Game onLeave={() => setGameId(0)} />
      ) : (
        <GamesList setGameId={setGameId} />
      )}
    </AppContainer>
  );
}

export default App;
