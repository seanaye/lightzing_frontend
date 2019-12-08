<template>
  <v-container fluid>
    <v-row justify="center">
      <v-col cols="12" sm="6" lg="5">
        <v-card color="purple" elevation="12">
          <v-card-title align="center">
            Hello, {{ givenName }}
          </v-card-title>
          <v-card-text>
            <v-row justify="center">
              <v-col cols="12" md="8" lg="6">
                <v-img :src="avatar" avatar />
              </v-col>
              <v-col cols="12">
                {{ currentStatus }}
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions>
            <v-row justify="center">
              <v-col cols="12">
                <v-text-field v-model="newStatus" outlined color="white" label="Enter a new status:" />
              </v-col>
              <v-col cols="12" md="6">
                <v-btn color="purple darken-4" rounded @click="updateStatus">
                  Update Status
                </v-btn>
              </v-col>
              <v-col cols="12" md="6">
                <v-btn color="purple darken-4" rounded @click="signOut">
                  Sign Out
                </v-btn>
              </v-col>
            </v-row>
          </v-card-actions>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" lg="5">
        <v-card>
          <v-card-actions>
            <v-row justify="center" style="width: 100%">
              <v-col cols="12">
                <v-text-field v-model="searchUserQuery" color="white" outlined label="Search users">
                  <template v-slot:append>
                    <v-icon @click="searchUser">
                      mdi-magnify
                    </v-icon>
                  </template>
                </v-text-field>
              </v-col>
              <v-col cols="12">
                <FriendList />
              </v-col>
            </v-row>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
// import { userSession } from '../userSession'
import { lookupProfile } from 'blockstack'
import FriendList from '~/components/FriendList'

export default {
  components: {
    FriendList
  },
  data () {
    return {
      searchUserQuery: '',
      newStatus: ''
    }
  },
  computed: {
    avatar () {
      return this.$store.getters['user/userObj'].avatarUrl
    },
    givenName () {
      return this.$store.getters['user/userObj'].name
    },
    currentStatus () {
      return this.$store.state.user.currentStatus
    }
  },
  methods: {
    signOut () {
      this.$store.dispatch('user/LOGOUT')
    },
    updateStatus () {
      this.$store.dispatch('user/UPDATE_STATUS', this.newStatus)
      this.newStatus = ''
    },
    async searchUser () {
      const result = await lookupProfile(this.searchUserQuery)
        .catch(e => console.error(e))
      if (result) {
        this.$store.dispatch('friends/ADD_FRIENDS', { friends: [this.searchUserQuery], loadProfiles: true })
      }
    }
  }
}
</script>

<style scoped></style>
