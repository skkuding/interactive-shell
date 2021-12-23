<template>
  <div id="app">
    <socket />
  </div>
</template>

<script>
import socket from './components/socket.vue'

export default {
  name: 'App',
  components: {
    socket
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
