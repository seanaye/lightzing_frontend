<template>
  <v-card>
    <v-row align="center" justify="start">
      <v-col v-for="person in splitComputed" :key="person.username" class="auto">
        <span class="mx-4">Split With: </span>
        <v-chip
          close
          @click:close="remove(person)"
        >
          <v-avatar left>
            <v-img :src="getAvatar(person)"></v-img>
          </v-avatar>
          {{ getName(person) }}
        </v-chip>
      </v-col>
    </v-row>
  </v-card>
</template>

<script>

export default {
  computed: {
    splitWith () {
      return this.$store.state.splitWith
    },
    splitComputed () {
      return this.$store.state.friends.loadedFriends.filter(elem => this.splitWith.includes(elem.username))
    }
  },
  methods: {
    getAvatar (profile) {
      return profile.avatarUrl() || 'https://s3.amazonaws.com/onename/avatar-placeholder.png'
    },
    remove (id) {
      const newIDs = this.splitWith.filter(elem => elem !== id)
      this.$store.commit('M_EXPENSE_DIALOG', { show: true, splitWith: newIDs })
    },
    getName (profile) {
      return profile.name() || profile.username
    },
    loadOthers () {
      const loaded = this.splitComputed.map(elem => elem.username)
      const toLoad = this.splitWith.filter(elem => !loaded.includes(elem))
      for (let i = 0; i < toLoad.length; i++) {
        this.$store.dispatch('friends/LOAD_PROFILE', toLoad[i])
      }
    }
  }
}
</script>
