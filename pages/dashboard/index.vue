<template>
  <v-container>
    <v-row justify="start">
      <v-col cols="12">
        <v-card color="blue darken-3" elevation="12">
          <UserProfile :id="userId"></UserProfile>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6">
        <v-card color="purple darken-4" class="px-3 py-3" elevation="12">
          <FriendSearch color="purple darken-4"></FriendSearch>
          <v-progress-linear
            :active="$store.state.friends.isLoading"
            indeterminate
          >
          </v-progress-linear>
          <FriendList color="purple darken-4"></FriendList>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import UserProfile from '~/components/UserProfile'
import FriendList from '~/components/FriendList'
import FriendSearch from '~/components/FriendSearch'

export default {
  components: {
    UserProfile,
    FriendSearch,
    FriendList
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
