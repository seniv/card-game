import styled from 'styled-components';

const Clickable = styled.button`
  padding: 0;
  margin: 0;
  border: none;
  outline: none;
`;

Clickable.defaultProps = {
  type: 'button',
};

export default Clickable;
