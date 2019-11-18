<template>
  <v-list two-line>
    <template v-for="(friend, i) in friends">
      <v-list-item
        @click="goToProfile(friend.username)"
        :key="i * 2 + 1"
      >
        <v-list-item-avatar>
          <v-img :src="friend.avatarUrl () || 'https://s3.amazonaws.com/onename/avatar-placeholder.png'"></v-img>
        </v-list-item-avatar>
        <v-list-item-content>
          <v-list-item-title v-html="friend.name() || 'Nameless Person'">
          </v-list-item-title>
          <v-list-item-subtitle v-text="friend.description()">
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
      <v-divider :key="i * 2"></v-divider>
    </template>
  </v-list>
</template>

<script>
export default {
  created () {
    this.$store.dispatch('friends/LOAD_PROFILES')
  },
  computed: {
    friends () {
      return this.$store.state.friends.loadedFriends
    }
  },
  methods: {
    goToProfile (id) {
      this.$router.push(`user/${id}`)
    }
  }
}
</script>
