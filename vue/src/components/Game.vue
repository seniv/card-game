<template>
  <div class="game">
    <ul class="enemy-cards">
      <card-back :title="enemyCards"></card-back>
    </ul>
    <ul class="playground">
      <li v-for="(card, index) in playground" :key="index">
        <ul>
          <card-front :suit="card.placedCard.suit" size="super-small" :card="card.placedCard.card"></card-front>
          <card-front v-show="card.beatedCard" :suit="card.beatedCard.suit" size="super-small" :card="card.beatedCard.card"></card-front>
        </ul>
      </li>
    </ul>
    <ul class="cards-left">
      <card-back v-show="cardsLeft > 1"></card-back>
      <card-front v-show="cardsLeft > 0 && trump" :suit="trump.suit" style="transform: rotate(90deg); margin-left: -40px; margin-right: 40px;" :card="trump.card"></card-front>
      <li style="display: inline-block;">Cards left:<br>{{cardsLeft}}</li>
    </ul>
    <ul class="your-cards">
      <card-front @click="clickOnCard" :suit="card.suit" :size="getSize(cards.length)" :card="card.card" v-for="(card, index) in cards" :key="index"></card-front>
    </ul>
    <button @click="$socket.emit('startGame')">start game</button>
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
  data () {
    return {
      cards: [],
      trump: false,
      enemyCards: 0,
      cardsLeft: 0,
      yourMove: 0,
      playground: []
    }
  },
  sockets: {
    connect () {
      console.log('socket connected')
    },
    massage (text) {
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
    clickOnCard (data) {
      if (this.yourMove > 0) {
        this.$socket.emit('makeMove', data)
      }
      console.log('clicked on card', data)
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
