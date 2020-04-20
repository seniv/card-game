import { Card } from './interfaces';

export function randomKey<T>(map: Map<T, any>): T {
  const items = Array.from(map.keys());
  return items[Math.floor(Math.random() * items.length)];
}

export function mapToArray<T>(map: Map<any, T>): Array<T> {
  return Array.from(map.values());
}

export const allHaveSameValue = (cards: Array<Card>): boolean => {
  let lastValue;
  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    if (!lastValue) {
      lastValue = card.value;
    }
    if (card.value !== lastValue) {
      return false;
    }
  }
  return true;
};
