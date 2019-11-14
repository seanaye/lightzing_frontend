<template>
  <v-container fluid>
    <v-row justify="center">
      <v-col cols="12" sm="6" lg="5">
        <v-card color="purple" elevation="12">
          <v-card-title align="center">Hello, {{ givenName }}</v-card-title>
          <v-card-text>
            <v-row justify="center">
              <v-col cols="12" md="8" lg="6">
                <v-img :src="avatar" avatar></v-img>
              </v-col>
              <v-col cols="12">
                {{ currentStatus }}
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions>
            <v-row justify="center">
              <v-col cols="12">
                <v-text-field v-model="newStatus" outlined color="white" label="Enter a new status:"></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-btn @click="updateStatus" color="purple darken-4" rounded>Update Status</v-btn>
              </v-col>
              <v-col cols="12" md="6">
                <v-btn @click="signOut" color="purple darken-4" rounded>Sign Out</v-btn>
              </v-col>
            </v-row>
          </v-card-actions>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" lg="5">
        <v-card>
          <v-card-actions>
            <v-row justify="center">
              <v-col cols="12">
                <v-text-field v-model="searchUserQuery" color="white" outlined label="Search users">
                  <template v-slot:append>
                    <v-icon @click="searchUser">mdi-magnify</v-icon>
                  </template>
                </v-text-field>
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

export default {
  data () {
    return {
      searchUserQuery: '',
      newStatus: ''
    }
  },
  methods: {
    signOut () {
      this.$store.commit('user/LOGOUT')
    },
    updateStatus () {
      this.$store.dispatch('user/UPDATE_STATUS', this.newStatus)
      this.newStatus = ''
    },
    async searchUser () {
      try {
        const result = await lookupProfile(this.searchUserQuery)
        console.log(result)
        if (result) {
          this.$store.dispatch('user/ADD_FRIENDS', [this.searchUserQuery])
        }
      } catch (err) {
        console.log(err)
      }
      // const options = {
      //   username: this.searchUserQuery,
      //   decrypt: false
      // }
      // const status = await this.$store.state.user.userSession.getFile('status.json', options)
      // console.log(status)
    }
  },
  created () {
    this.$store.dispatch('user/LOAD_STATUS')
    this.$store.dispatch('user/LOAD_FRIENDS')
  },
  computed: {
    avatar () {
      const a = this.$store.state.user.person.avatarUrl()
      return a || 'https://s3.amazonaws.com/onename/avatar-placeholder.png'
    },
    givenName () {
      const name = this.$store.state.user.person.name()
      return name || 'Nameless Person'
    },
    currentStatus () {
      return this.$store.state.user.currentStatus
    },
    friends () {
      return this.$store.state.user.friends
    }
  }
}
</script>

<style scoped></style>
