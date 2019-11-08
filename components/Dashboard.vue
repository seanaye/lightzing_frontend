<template>
  <div class="panel-welcome" id="section-2">
    <div class="avatar-section">
      <img :src="avatar" class="img-rounded avatar" id="avatar-image">
    </div>
    <h1 class="landing-heading">Hello, <span id="heading-name">{{ givenName }}</span>!</h1>
    <h4 class="landing-heading">Your identity is verified with Blockstack!</h4>
    <p class="lead">
      <a
        href="#"
        class="btn btn-primary btn-lg"
        id="signout-button"
        @click.prevent="signOut"
      >
        Logout
      </a>
    </p>
  </div>
</template>

<script>
// import { userSession } from '../userSession'

export default {
  methods: {
    signOut () {
      this.$store.commit('user/LOGOUT')
    }
  },
  computed: {
    avatar () {
      const a = this.$store.state.user.person.avatarUrl()
      return a || 'https://s3.amazonaws.com/onename/avatar-placeholder.png'
    },
    givenName () {
      const name = this.$store.state.user.person.name()
      return name || 'Nameless Person'
    }
  }
}
</script>

<style scoped></style>
