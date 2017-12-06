<template>
  <div class="game">
    <ul class="enemy-cards">
      <card-back :title="enemyCards"></card-back>
    </ul>
    <ul class="playground">
      <li v-for="(card, index) in playground" :key="index">
        <ul>
          <card-front :mast="card.placedCard.mast" size="super-small" :card="card.placedCard.card"></card-front>
          <card-front v-show="card.beatedCard" :mast="card.beatedCard.mast" size="super-small" :card="card.beatedCard.card"></card-front>
        </ul>
      </li>
    </ul>
    <ul class="cards-left">
      <card-back v-show="cardsLeft > 1"></card-back>
      <card-front v-show="cardsLeft > 0 && cozur" :mast="cozur.mast" style="transform: rotate(90deg); margin-left: -40px; margin-right: 40px;" :card="cozur.card"></card-front>
      <li style="display: inline-block;" @click="$socket.emit('createGame')">Cards left:<br>{{cardsLeft}}</li>
    </ul>
    <ul class="your-cards">
      <card-front :mast="card.mast" :size="getSize(cards.length)" :card="card.card" v-for="(card, index) in cards" :key="index"></card-front>
    </ul>
    <button @click="$socket.emit('startGame')">start game</button>
  </div>
</template>

<script>
import CardFront from '@/components/CardFront.vue'
import CardBack from '@/components/CardBack.vue'

export default {
  name: 'game',
  components: {
    CardFront,
    CardBack
  },
  data () {
    return {
      cards: [
        {card: 'j', mast: 'heart'},
        {card: 'q', mast: 'diams'},
        {card: 'k', mast: 'spades'},
        {card: 'a', mast: 'clubs'},
        {card: 'a', mast: 'clubs'},
        {card: 'a', mast: 'clubs'}
      ],
      cozur: false,
      enemyCards: 6,
      cardsLeft: 36,
      playground: [{
        placedCard: {
          card: 'j',
          mast: 'heart'
        },
        beatedCard: {
          card: 'a',
          mast: 'heart'
        }
      }, {
        placedCard: {
          card: 'j',
          mast: 'spades'
        },
        beatedCard: {
          card: 'a',
          mast: 'spades'
        }
      }]
    }
  },
  sockets: {
    connect () {
      console.log('socket connected')
    },
    massage (text) {
      console.log(text)
    },
    gameUpdate (data) {
      console.log('game updated')
      if (data.cozur) this.cozur = data.cozur
      this.cards = data.cards
      this.cardsLeft = data.cardsLeft
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
