<template>
  <li class="card" @click="$emit('click', card + ':' + mast)" :data-card="card" :class="[red, size]" v-html="symbol"></li>
</template>

<script>
export default {
  name: 'card-front',
  props: ['card', 'mast', 'size'],
  data () {
    return {
    }
  },
  computed: {
    symbol () {
      switch (this.mast) {
        case 'heart': return '&hearts;'
        case 'diams': return '&diams;'
        case 'spades': return '&spades;'
        case 'clubs': return '&clubs;'
      }
      return ''
    },
    red () {
      if (this.mast === 'heart' || this.mast === 'diams') {
        return 'red'
      }
      return ''
    }
  }
}
</script>

<style>
  li.card {
    display: inline-block;
    width: 80px;
    height: 130px;
    background-color: #fff;
    border-radius: 5px;
    transition: .3s;
    padding-top: 25px;
    font-size: 65px;
    position: relative;
    cursor: pointer;
    box-sizing: border-box;
    text-align: center;
    user-select: none;
  }

  li.card.red {
    color: #d00;
  }

  li.card:not(:first-child) {
    margin-left: 5px;
  }

  li.card.super-small:not(:first-child) {
    margin-left: -70px;
    box-shadow: -5px 0px 10px 0px rgba(0, 0, 0, 0.05);
  }

  li.card.very-small:not(:first-child) {
    margin-left: -50px;
    box-shadow: -5px 0px 10px 0px rgba(0, 0, 0, 0.05);
  }

  li.card.small:not(:first-child) {
    margin-left: -30px;
    box-shadow: -5px 0px 10px 0px rgba(0, 0, 0, 0.05);
  }

  li.card:hover {
    transform: scale(1.1);
    box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.20);
    z-index: 322;
  }

  li.card::before,
  li.card::after {
    position: absolute;
    content: attr(data-card);
    text-transform: uppercase;
    font-size: 24px;
  }

  li.card::before {
    top: 10px;
    left: 10px;
  }

  li.card::after {
    bottom: 10px;
    right: 10px;
    transform: rotate(180deg)
  }

  /* @media screen and (max-width:768px) {
    li.card:not(:first-child) {
      margin-left: -20px;
      box-shadow: -5px 0px 10px 0px rgba(0, 0, 0, 0.15);
    }
    li.card:hover {
      box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.20);
    }
  } */
</style>