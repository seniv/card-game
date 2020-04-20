import React from 'react';
import CardBack from '../components/CardBack';
import CardFront from '../components/CardFront';

interface Props {
  id: number;
}

const Game = (props: Props) => (
  <>
    <CardBack />
    <CardFront card={{ id: 1, value: 5, suit: 'hearts' }} />
    <CardFront card={{ id: 2, value: 5, suit: 'spades' }} />
  </>
);

export default Game;
