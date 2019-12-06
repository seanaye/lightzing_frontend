<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12">
        {{ $store.state.payment.payments }}
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  created () {
    // load expenses
    this.loadAll()
  },
  methods: {
    async loadAll () {
      await this.$store.dispatch('friends/LOAD_FRIENDS', { loadProfiles: true })
      for (const friend of this.$store.getters['friends/loadedFriendsObj']) {
        await this.$store.dispatch('payment/LOAD_PAYMENT', friend.username)
      }
    }
  }
}
</script>
