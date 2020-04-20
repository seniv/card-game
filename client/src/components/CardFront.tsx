import React from 'react';
import styled, { css } from 'styled-components';

const Card = styled.li<{ isRed: boolean, isSelected?: boolean, dangerouslySetInnerHTML: any }>`
  display: inline-block;
  width: 80px;
  height: 130px;
  background-color: #fff;
  border-radius: 5px;
  transition: .3s;
  padding-top: 25px;
  font-size: 65px;
  position: relative;
  cursor: pointer;
  box-sizing: border-box;
  text-align: center;
  user-select: none;

  ${(p) => p.isRed && css`
    color: #d00;
  `}

  ${(p) => p.isSelected && css`
    bottom: 30px;
  `}

  &:not(:first-child) {
    margin-left: 5px;
  }

  /* &.super-small:not(:first-child) {
    margin-left: -70px;
    box-shadow: -5px 0px 10px 0px rgba(0, 0, 0, 0.05);
  }

  &.very-small:not(:first-child) {
    margin-left: -50px;
    box-shadow: -5px 0px 10px 0px rgba(0, 0, 0, 0.05);
  }

  &.small:not(:first-child) {
    margin-left: -30px;
    box-shadow: -5px 0px 10px 0px rgba(0, 0, 0, 0.05);
  } */

  &:hover {
    transform: scale(1.1);
    box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.20);
    z-index: 322;
  }

  &::before,
  &::after {
    position: absolute;
    content: attr(data-card);
    text-transform: uppercase;
    font-size: 24px;
  }

  &::before {
    top: 10px;
    left: 10px;
  }

  &::after {
    bottom: 10px;
    right: 10px;
    transform: rotate(180deg)
  }
`;

interface Card {
  id: number;
  value: number;
  suit: string;
}

interface Props {
  card: Card;
  isSelected?: boolean;
  size?: boolean;
}

const getLabel = (value: number): string => {
  const cardLabels = ['6', '7', '8', '9', '10', 'j', 'q', 'k', 'a'];
  return cardLabels[value - 1] || 'None';
};

const CardFront = ({ card }: Props) => {
  const isRed = card.suit === 'hearts' || card.suit === 'diams';
  return (
    <Card
      isRed={isRed}
      dangerouslySetInnerHTML={{ __html: `&${card.suit};` }}
      data-card={getLabel(card.value)}
    />
  );
};

export default CardFront;
