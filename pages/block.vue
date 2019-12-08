<template>
  <div>
    <landing v-if="!userSession.isUserSignedIn()" />
    <dashboard v-if="person" :user="person" />
  </div>
</template>

<script>
import Landing from '~/components/Landing'
import Dashboard from '~/components/Dashboard'

export default {
  name: 'Home',
  components: { Landing, Dashboard },
  middleware: 'auth',
  computed: {
    userSession () {
      return this.$store.state.user.userSession
    },
    person () {
      return this.$store.state.user.person
    }
  }
}
</script>
