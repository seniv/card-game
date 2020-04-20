<template>
  <div class="game">
    <ul class="enemy-cards">
      <card-back :title="enemyCards"></card-back>
    </ul>
    <ul class="playground">
      <li v-for="(card) in playground" :key="card.id">
        <ul>
          <card-front @click="beat(card.placedCard)" :suit="card.placedCard.suit" size="super-small" :value="card.placedCard.value"></card-front>
          <card-front v-if="card.beatenCard" :suit="card.beatenCard.suit" size="super-small" :value="card.beatenCard.value"></card-front>
        </ul>
      </li>
    </ul>
    <ul class="cards-left">
      <card-back v-show="cardsLeft > 1"></card-back>
      <card-front v-show="cardsLeft > 0 && trump" :suit="trump.suit" style="transform: rotate(90deg); margin-left: -40px; margin-right: 40px;" :value="trump.value"></card-front>
      <li style="display: inline-block;">Cards left:<br>{{cardsLeft}}</li>
    </ul>
    <span v-text="move"></span>
    <ul class="your-cards">
      <card-front
        :suit="card.suit"
        :size="getSize(cards.length)"
        :value="card.value"
        :selected="isSelected(card)"
        v-for="(card) in cards"
        @click="clickOnCard(card)"
        :key="card.id"
      />
    </ul>
    <button v-if="!!selectedCardIds.length && yourMove === 1" @click="placeCards">Place cards</button>
    <button v-if="displayTakeCards" @click="$socket.emit('takeCards')">Take cards</button>
    <button v-if="!isGameStarted" @click="$socket.emit('startGame')">Start game</button>
    <button @click="leaveGame">Leave game</button>
  </div>
</template>

<script>
import CardFront from '@/components/CardFront.vue'
import CardBack from '@/components/CardBack.vue'

export default {
  props: ['id'],
  name: 'game',
  components: {
    CardFront,
    CardBack
  },
  computed: {
    move () {
      switch (this.yourMove) {
        case 1: return 'Your move'
        case 2: return 'You must beat'
        default: return ''
      }
    },
    displayTakeCards () {
      return this.yourMove === 2 && this.playground.some(slot => !slot.beatenCard)
    }
  },
  data () {
    return {
      cards: [],
      trump: false,
      enemyCards: 0,
      cardsLeft: 0,
      yourMove: 0,
      playground: [],
      isGameStarted: false,
      selectedCardIds: []
    }
  },
  sockets: {
    connect () {
      console.log('socket connected')
    },
    message (text) {
      console.log(text)
      alert(text)
    },
    gameUpdate (data) {
      console.log(data)
      console.log('game updated')
      if (data.trump) this.trump = data.trump
      this.cards = data.cards
      this.cardsLeft = data.cardsLeft
      this.playground = data.playground
      this.yourMove = data.yourMove
      this.isGameStarted = data.isGameStarted
    }
  },
  methods: {
    getSize (count) {
      if (count > 15) {
        return 'very-small'
      } else if (count > 9) {
        return 'small'
      }
      return ''
    },
    isSelected (card) {
      return this.selectedCardIds.includes(card.id)
    },
    clickOnCard (card) {
      if (this.yourMove === 1) {
        const index = this.selectedCardIds.indexOf(card.id)
        if (index !== -1) {
          this.selectedCardIds.splice(index, 1)
        } else {
          const firstSelectedCard = this.cards.find(({ id }) => id === this.selectedCardIds[0])
          if (firstSelectedCard && firstSelectedCard.value === card.value) {
            this.selectedCardIds.push(card.id)
          } else {
            this.selectedCardIds = [card.id]
          }
        }
      } else if (this.yourMove === 2) {
        this.selectedCardIds = [card.id]
      }
      console.log('selected cards', this.selectedCardIds)
      console.log('clicked on card', card)
    },
    placeCards () {
      this.$socket.emit('makeMove', { cardIds: this.selectedCardIds })
    },
    beat (card) {
      this.$socket.emit('makeMove', { cardIds: this.selectedCardIds, cardIdToBeat: card.id })
      this.selectedCardIds = []
    },
    leaveGame () {
      this.$router.replace('/')
      this.$socket.emit('leaveGame')
    }
  }
}
</script>

<style>
h1, h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 10px;
  margin: 0;
}
a {
  color: #42b983;
}
.playground {
  height: 300px;
  padding: 0;
  width: 355px;
  margin: auto;
  /* background-color: #ddd; */
}

.playground > li {
  display: inline-block;
}
.cards-left {
  height: 200px;
  width: 355px;
  margin: auto;
  padding: 20px;
  box-sizing: border-box;
}
</style>
