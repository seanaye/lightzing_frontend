<template>
  <v-list two-line :color="color">
    <v-subheader>Following:</v-subheader>
    <v-divider />
    <v-slide-y-transition group mode="out-in">
      <template v-for="(friend, i) in friendsObj">
        <v-list-item
          :key="i * 2 + 1"
          @click="$router.push(`/user/${friend.username}`)"
        >
          <v-list-item-avatar>
            <v-img :src="friend.avatarUrl" />
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title v-html="friend.name" />
            <v-list-item-subtitle v-text="friend.description" />
          </v-list-item-content>
        </v-list-item>
        <v-divider :key="i * 2" />
      </template>
    </v-slide-y-transition>
  </v-list>
</template>

<script>
export default {
  props: {
    color: String
  },
  computed: {
    friendsObj () {
      return this.$store.getters['friends/loadedFriendsObj']
    }
  }
}
</script>
