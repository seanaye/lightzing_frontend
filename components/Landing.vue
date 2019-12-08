<template>
  <div id="section-1" class="panel-landing">
    <h1 class="landing-heading">
      Hello, Blockstack!
    </h1>
    <p class="lead">
      <a
        id="signin-button"
        href="#"
        class="btn btn-primary btn-lg"
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
  name: 'Signin',
  computed: {
    userSession () {
      return this.$store.state.user.userSession
    }
  },
  methods: {
    signIn () {
      this.userSession.redirectToSignIn(window.location.href)
    }
  }
}
</script>

<style scoped></style>
