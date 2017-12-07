import Vue from 'vue'
import Router from 'vue-router'
import Game from '@/components/Game'
import Main from '@/components/Index'

Vue.use(Router)

export default new Router({
  routes: [{
    path: '/game/:id',
    name: 'game',
    component: Game
  }, {
    path: '/',
    name: 'index',
    component: Main
  }]
})
