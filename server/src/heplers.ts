export function randomKey<T>(map: Map<T, any>): T {
  const items = Array.from(map.keys())
  return items[Math.floor(Math.random() * items.length)]
}
