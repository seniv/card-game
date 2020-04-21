import React from 'react';
import styled from 'styled-components';
import { PlaygroundSlot } from '../interfaces';
import CardFront, { CardSizes } from './CardFront';

const Container = styled.ul`
  height: 300px;
  padding: 0;
  width: 355px;
  margin: auto;

  > li {
    display: inline-block;
  }
`;

interface Props {
  playground: Array<PlaygroundSlot>;
  onClickPlacedCard: Function;
}

const Playground = ({ playground, onClickPlacedCard }: Props) => (
  <Container className="playground">
    {playground.map((playgroundSlot, index) => (
      <li key={index}>
        <ul>
          <CardFront
            card={playgroundSlot.placedCard}
            onClick={(): void => onClickPlacedCard(playgroundSlot.placedCard)}
            size={CardSizes.ExtremelySmall}
          />
          {playgroundSlot.beatenCard && (
            <CardFront card={playgroundSlot.beatenCard} size={CardSizes.ExtremelySmall} />
          )}
        </ul>
      </li>
    ))}
  </Container>
);

export default Playground;
