<template>
  <div class="center">
    <landing v-if="! $userSession.isUserSignedIn()"></landing>
    <dashboard v-if="user" :user="user"></dashboard>

  </div>
</template>

<script>
import { Person } from 'blockstack'
import Landing from '~/components/Landing'
import Dashboard from '~/components/Dashboard'
// import { userSession } from '../userSession'

export default {
  name: 'Home',
  components: { Landing, Dashboard },
  mounted () {
    console.log(this.$userSession)
    if (this.$userSession.isUserSignedIn()) {
      this.userData = this.$userSession.loadUserData()
      this.user = new Person(this.userData.profile)
      this.user.username = this.userData.username
    } else if (this.$userSession.isSignInPending()) {
      this.$userSession.handlePendingSignIn()
    }
  },
  data () {
    return {
      userSession: null,
      user: null
    }
  }
}
</script>
