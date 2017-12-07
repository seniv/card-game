<template>
  <div class="index">
    <ul class="games-list">
      <li v-for="(game, index) in games" :key="index" :class="{active: !game.started}" @click="goToGame(game)">
        <span>{{game.id}}</span>
        <span>{{game.players}}</span>
        <span>{{game.started}}</span>
      </li>
    </ul>
    <button @click="$socket.emit('createGame')">Create new Game</button>
  </div>
</template>

<script>
export default {
  name: 'index',
  data () {
    return {
      games: []
    }
  },
  sockets: {
    gamesList (games) {
      console.log(games)
      this.games = games
    },
    gameIsReady (id) {
      this.$router.push({name: 'game', params: { id }})
    }
  },
  computed: {
  },
  methods: {
    goToGame (game) {
      if (!game.started) {
        this.$socket.emit('connectToGame', game.id)
      }
    }
  },
  watch: {
  },
  filters: {
  },
  mounted () {
    this.$socket.emit('getGames')
  }
}
</script>

<style scoped>
  ul.game-list {
    width: 800px;
    height: 600px;
  }
  li.active:hover {
    background-color: #ddd;
    cursor: pointer;
  }
</style>