const randomKey = (map) => {
  const items = Array.from(map.keys())
  return items[Math.floor(Math.random() * items.length)]
}

exports = {
  randomKey
}
