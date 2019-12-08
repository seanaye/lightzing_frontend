<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" sm="10">
        <v-card color="primary" elevation="12">
          <UserProfile :id="userId" />
        </v-card>
      </v-col>
      <v-col cols="12" sm="10">
        <v-card color="info darken-2" class="px-3 py-3" elevation="12">
          <FriendSearch color="info darken-2" />
          <v-progress-linear
            :active="$store.state.friends.isLoading > 0"
            indeterminate
          />
          <FriendList color="info darken-2" />
        </v-card>
      </v-col>
      <v-col cols="12" sm="10">
        <v-card color="purple" elevation="12">
          <PaymentFeed color="purple" />
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import UserProfile from '~/components/UserProfile'
import FriendList from '~/components/FriendList'
import FriendSearch from '~/components/FriendSearch'
import PaymentFeed from '~/components/PaymentFeed'

export default {
  components: {
    UserProfile,
    FriendSearch,
    FriendList,
    PaymentFeed
  },
  created () {
    this.loadAll()
  },
  methods: {
    async loadAll () {
      await this.$store.dispatch('friends/LOAD_FRIENDS', { loadProfiles: true })
      for (const friend of this.$store.getters['friends/loadedFriendsObj']) {
        this.$store.dispatch('payment/LOAD_OTHER_PAYMENT', friend.username)
        this.$store.dispatch('payment/LOAD_SELF_PAYMENT', friend.username)
      }
    }
  },
  transition: {
    name: 'fade-transition',
    mode: 'out-in'
  },
  computed: {
    userId () {
      return this.$store.state.user.userData.username
    }
  },
  middleware: 'auth'
}
</script>
