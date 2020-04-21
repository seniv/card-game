import React from 'react';
import * as R from 'ramda';
import styled from 'styled-components';

import { socket } from '../socket';
import {
  Card, MoveStates, PlaygroundSlot, GameUpdate,
} from '../interfaces';
import CardBack from '../components/CardBack';
import CardFront, { CardSizes } from '../components/CardFront';
import Playground from '../components/Playground';

const TrumpCard = styled(CardFront)`
  transform: rotate(90deg) !important;
  margin-left: -40px !important;
  margin-right: 40px !important;
`;

interface State {
  cards: Array<Card>;
  trump?: Card;
  cardsLeft: number;
  yourMove: MoveStates;
  playground: Array<PlaygroundSlot>;
  isGameStarted: boolean;
  selectedCardIds: Array<number>;
}

interface Props {
  onLeave: Function;
}

const getMoveText = (moveState: MoveStates): string => {
  switch (moveState) {
    case 1: return 'Your move';
    case 2: return 'You must beat';
    default: return '';
  }
};

const getCardSize = (count: number): CardSizes | undefined => {
  if (count > 15) {
    return CardSizes.VerySmall;
  } if (count > 9) {
    return CardSizes.Small;
  }
  return undefined;
};

class Game extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      cards: [],
      trump: undefined,
      cardsLeft: 0,
      yourMove: 0,
      playground: [],
      isGameStarted: false,
      selectedCardIds: [],
    };

    this.onMessage = this.onMessage.bind(this);
    this.onGameUpdated = this.onGameUpdated.bind(this);
  }

  componentDidMount(): void {
    socket.on('message', this.onMessage);
    socket.on('gameUpdate', this.onGameUpdated);
  }

  componentWillUnmount(): void {
    socket.removeListener('message', this.onMessage);
    socket.removeListener('gameUpdate', this.onGameUpdated);
  }

  onMessage = (message: string): void => {
    // eslint-disable-next-line no-alert
    alert(message);
  }

  onGameUpdated(data: GameUpdate): void {
    console.log('Game updated', data);
    this.setState(data);
  }

  startGame = (): void => {
    socket.emit('startGame');
  }

  takeCards = (): void => {
    socket.emit('takeCards');
  }

  placeCards = (): void => {
    const { selectedCardIds } = this.state;
    socket.emit('makeMove', { cardIds: selectedCardIds });
  }

  isSelected = (card: Card): boolean => {
    const { selectedCardIds } = this.state;
    return selectedCardIds.includes(card.id);
  }

  beat = (card: Card): void => {
    const { selectedCardIds } = this.state;
    console.log('beat', { cardIds: selectedCardIds, cardIdToBeat: card.id });
    socket.emit('makeMove', { cardIds: selectedCardIds, cardIdToBeat: card.id });
    this.setState({
      selectedCardIds: [],
    });
  }

  clickOnCard(card: Card): void {
    const { yourMove, selectedCardIds, cards } = this.state;
    if (yourMove === MoveStates.MOVE) {
      const index = selectedCardIds.indexOf(card.id);
      if (index !== -1) {
        this.setState({ selectedCardIds: R.remove(index, 1, selectedCardIds) });
      } else {
        const firstSelectedCard = cards.find(({ id }) => id === selectedCardIds[0]);
        if (firstSelectedCard && firstSelectedCard.value === card.value) {
          this.setState({ selectedCardIds: [...selectedCardIds, card.id] });
        } else {
          this.setState({ selectedCardIds: [card.id] });
        }
      }
    } else if (yourMove === MoveStates.BEAT) {
      this.setState({ selectedCardIds: [card.id] });
    }
    console.log('selected cards', selectedCardIds);
    console.log('clicked on card', card);
  }

  render() {
    const {
      yourMove, selectedCardIds, playground, isGameStarted, cardsLeft, trump, cards,
    } = this.state;
    const { onLeave } = this.props;
    return (
      <div>
        <ul>
          <CardBack />
        </ul>
        <Playground playground={playground} onClickPlacedCard={this.beat} />
        <ul className="cards-left">
          {cardsLeft > 1 && (
            <CardBack />
          )}
          {cardsLeft > 0 && !!trump && (
            <TrumpCard card={trump} />
          )}
          <li style={{ display: 'inline-block' }}>Cards left:<br />{cardsLeft}</li>
        </ul>
        <span>{getMoveText(yourMove)}</span>
        <ul className="your-cards">
          {cards.map((card) => (
            <CardFront
              key={card.id}
              card={card}
              isSelected={this.isSelected(card)}
              onClick={() => this.clickOnCard(card)}
              size={getCardSize(cards.length)}
            />
          ))}
        </ul>
        {yourMove === MoveStates.MOVE && !!selectedCardIds.length && (
          <button type="button" onClick={this.placeCards}>Place cards</button>
        )}
        {yourMove === MoveStates.BEAT && playground.some((slot) => !slot.beatenCard) && (
          <button type="button" onClick={this.takeCards}>Take cards</button>
        )}
        {!isGameStarted && (
          <button type="button" onClick={this.startGame}>Start game</button>
        )}
        <button type="button" onClick={onLeave as any}>Leave game</button>
      </div>
    );
  }
}

export default Game;
