<template>
  <li class="card-back" :title="title" :class="[size]">&blk14;</li>
</template>

<script>
export default {
  name: 'card-back',
  props: ['size', 'title'],
  data () {
    return {
    }
  },
  computed: {
  }
}
</script>

<style scoped>
  li.card-back {
    display: inline-block;
    width: 80px;
    height: 130px;
    background-color: #fff;
    border-radius: 5px;
    transition: .3s;
    padding-top: 12px;
    padding-left: 10px;
    text-align: left;
    font-size: 80px;
    position: relative;
    cursor: auto;
    box-sizing: border-box;
    user-select: none;
    z-index: 10;
  }

  li.card-back.red {
    color: #d00;
  }

  li.card-back:not(:first-child) {
    margin-left: 5px;
  }

  li.card-back.super-small:not(:first-child) {
    margin-left: -80px;
    box-shadow: -5px 0px 10px 0px rgba(0, 0, 0, 0.05);
  }

  /* li.card-back:hover {
    transform: scale(1.1);
    box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.20);
    z-index: 322;
  } */
</style>