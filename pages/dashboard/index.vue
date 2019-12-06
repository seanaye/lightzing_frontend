<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" sm="10">
        <v-card color="primary" elevation="12">
          <UserProfile :id="userId"></UserProfile>
        </v-card>
      </v-col>
      <v-col cols="12" sm="10">
        <v-card color="info darken-2" class="px-3 py-3" elevation="12">
          <FriendSearch color="info darken-2"></FriendSearch>
          <v-progress-linear
            :active="$store.state.friends.isLoading > 0"
            indeterminate
          >
          </v-progress-linear>
          <FriendList color="info darken-2"></FriendList>
        </v-card>
      </v-col>
      <v-col cols="12" sm="10">
        <v-card color="purple" elevation="12">
          <PaymentFeed></PaymentFeed>
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
