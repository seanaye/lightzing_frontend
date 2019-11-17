<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" sm="10" lg="8">
        <v-card color="blue darken-2" elevation="12">
          <v-row justify="center">
            <v-col cols="12" sm="4" lg="2" class="text-center">
              <v-avatar size="120" class="ma-md-4">
                <v-img :src="avatarUrl"></v-img>
              </v-avatar>
            </v-col>
            <v-col cols="12" sm="8" lg="10">
              <div>
                <v-card-title class="headline">
                  {{ givenName }}
                </v-card-title>
                <v-card-subtitle>
                  {{ $route.params.id }}
                </v-card-subtitle>
                <v-divider></v-divider>
                <v-card-text>
                  {{ description }}
                </v-card-text>
              </div>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { lookupProfile, Person } from 'blockstack'

export default {
  middleware: 'auth',
  data () {
    return {
      person: '',
      description: '',
      givenName: '',
      avatarUrl: ''
    }
  },
  computed: {
    isLocal () {
      if (this.$store.state.user.userData) {
        return this.$route.params.id === this.$store.state.user.userData.username
      } else {
        return false
      }
    }
  },
  methods: {
    async loadProfile () {
      const userData = await lookupProfile(this.$route.params.id)
      this.person = new Person(userData)
      this.description = this.person.description()
      this.givenName = this.person.givenName() || 'Nameless Person'
      this.avatarUrl = this.person.avatarUrl() || 'https://s3.amazonaws.com/onename/avatar-placeholder.png'
    },
    setFromLocal () {
      this.description = this.$store.state.user.person.description()
      this.givenName = this.$store.state.user.person.givenName() || 'Nameless Person'
      this.avatarUrl = this.$store.state.user.person.avatarUrl() || 'https://s3.amazonaws.com/onename/avatar-placeholder.png'
    }
  },
  created () {
    if (this.isLocal) {
      this.setFromLocal()
    } else {
      this.loadProfile()
    }
  }
}
</script>
