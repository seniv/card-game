module.exports.cardWeight = (card) => {
  switch (card) {
    case '6': return 1
    case '7': return 2
    case '8': return 3
    case '9': return 4
    case '10': return 5
    case 'j': return 6
    case 'q': return 7
    case 'k': return 8
    case 'a': return 9
    default: return 0
  }
}

module.exports.randomKey = (map) => {
  const items = Array.from(map.keys())
  return items[Math.floor(Math.random() * items.length)]
}
