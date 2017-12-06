<template>
  <div class="hello">
    <ul class="your-cards">
      <card-front :mast="card.mast" :card="card.card" v-for="(card, index) in cards" :key="index"></card-front>
    </ul>
  </div>
</template>

<script>
import CardFront from '@/components/CardFront.vue'

export default {
  name: 'game',
  components: {
    CardFront
  },
  data () {
    return {
      cards: [
        {card: 'j', mast: 'heart'},
        {card: 'q', mast: 'diams'},
        {card: 'k', mast: 'spades'},
        {card: 'a', mast: 'clubs'}
      ]
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
  padding: 0;
  margin: 0;
}
a {
  color: #42b983;
}
</style>
