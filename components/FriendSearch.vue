<template>
  <div>
    <v-text-field
      v-model="searchUserQuery"
      color="accent"
      outlined
      label="Search users"
      @keydown.enter="searchUser"
    >
      <template v-slot:append>
        <v-icon @click="searchUser">
          mdi-magnify
        </v-icon>
      </template>
    </v-text-field>
    <v-slide-y-transition mode="out-in">
      <v-list
        v-if="completedQuery && !$store.state.friends.isLoading"
        :color="color"
      >
        <v-list-item v-if="loadedUserObj" @click="$router.push(`/user/${loadedUserObj.username}`)">
          <v-list-item-avatar>
            <v-img :src="loadedUserObj.avatarUrl" />
          </v-list-item-avatar>
          <v-list-item-title>
            {{ loadedUserObj.name }}
          </v-list-item-title>
          <v-list-item-action>
            <!-- <v-btn rounded :color="(isFriend) ? 'red': 'green'" block>
              {{ (isFriend) ? '- Unfollow' : '+ Follow' }}
            </v-btn> -->
            <v-btn icon>
              <v-icon :color="(isFriend) ? 'red' : 'green'" @click="addOrRemove">
                {{ (isFriend) ? 'mdi-minus' : 'mdi-plus' }}
              </v-icon>
            </v-btn>
          </v-list-item-action>
        </v-list-item>
        <v-list-item v-else>
          <v-list-item-title>
            No user found with that ID
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-slide-y-transition>
  </div>
</template>

<script>

export default {
  props: {
    color: String
  },
  data () {
    return {
      searchUserQuery: '',
      completedQuery: '',
      result: ''
    }
  },
  computed: {
    loadedUserObj () {
      if (this.completedQuery) {
        return this.$store.getters['friends/loadedObj'].filter(elem => elem.username === this.completedQuery)[0]
      } else {
        return ''
      }
    },
    friends () {
      return this.$store.state.friends.friends
    },
    isFriend () {
      return this.friends.reduce((acc, elem) => {
        return acc || elem === this.loadedUserObj.username
      }, false)
    }
  },
  methods: {
    searchUser () {
      this.completedQuery = this.searchUserQuery
      if (this.searchUserQuery) {
        this.$store.dispatch('friends/LOAD_PROFILE', this.searchUserQuery)
      }
    },
    addOrRemove () {
      if (this.isFriend) {
        this.$store.dispatch('friends/REMOVE_FRIEND', this.loadedUserObj.username)
      } else {
        this.$store.dispatch('friends/ADD_FRIENDS', { friends: [this.loadedUserObj.username], loadProfiles: false })
      }
      this.searchUserQuery = ''
      this.completedQuery = ''
    }
  }
}
</script>
