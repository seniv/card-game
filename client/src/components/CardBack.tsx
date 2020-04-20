import React from 'react';
import styled from 'styled-components';

const CardBackContainer = styled.li`
  display: inline-block;
  width: 80px;
  height: 130px;
  background-color: #fff;
  border-radius: 5px;
  transition: .3s;
  padding-top: 12px;
  padding-left: 10px;
  text-align: left;
  font-size: 80px;
  position: relative;
  cursor: auto;
  box-sizing: border-box;
  user-select: none;
  z-index: 10;
`;

const CardBack = () => (
  <CardBackContainer>░</CardBackContainer>
);

export default CardBack;
