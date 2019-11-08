<template>
  <div class="panel-landing" id="section-1">
    <h1 class="landing-heading">Hello, Blockstack!</h1>
    <p class="lead">
      <a
        href="#"
        class="btn btn-primary btn-lg"
        id="signin-button"
        @click.prevent="signIn"
      >
        Sign In with Blockstack
      </a>
    </p>
  </div>
</template>

<script>
// import { userSession } from '../userSession'
export default {
  name: 'signin',
  computed: {
    userSession () {
      return this.$store.state.user.userSession
    }
  },
  methods: {
    signIn () {
      this.userSession.redirectToSignIn('http://localhost:3000/block')
    }
  }
}
</script>

<style scoped></style>
