<template>
  <v-list two-line :color="color">
    <v-subheader>Following:</v-subheader>
    <v-divider></v-divider>
    <v-slide-y-transition group mode="out-in">
      <template v-for="(friend, i) in friendsObj">
        <v-list-item
          @click="goToProfile(friend.username)"
          :key="i * 2 + 1"
        >
          <v-list-item-avatar>
            <v-img :src="friend.avatarUrl"></v-img>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title v-html="friend.name">
            </v-list-item-title>
            <v-list-item-subtitle v-text="friend.description">
            </v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
        <v-divider :key="i * 2"></v-divider>
      </template>
    </v-slide-y-transition>
  </v-list>
</template>

<script>
export default {
  props: {
    color: String
  },
  created () {
    this.$store.dispatch('friends/LOAD_FRIENDS', { loadProfiles: true })
  },
  computed: {
    friendsObj () {
      return this.$store.getters['friends/loadedFriendsObj']
    }
  },
  methods: {
    goToProfile (id) {
      this.$router.push(`/user/${id}`)
    }
  }
}
</script>
