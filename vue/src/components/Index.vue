<template>
  <div class="index">
    <ul class="games-list">
      <li v-for="(game, index) in games" :key="index">
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
    gameCreated (id) {
      this.$router.push({name: 'game', params: { id }})
    }
  },
  computed: {
  },
  methods: {
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

<style>

</style>