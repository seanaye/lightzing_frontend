<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" sm="10" lg="8">
        <v-card color="blue darken-3" elevation="12">
          <v-row justify="space-around" dense>
            <v-col cols="12" sm="3" lg="2" class="text-center">
              <v-fade-transition mode="out-in">
                <v-avatar v-if="imageLoaded" size="120" class="ma-md-4 pt-5">
                  <img :src="avatarUrl">
                </v-avatar>
                <v-skeleton-loader v-else type="image" class="ma-md-4 pt-5"></v-skeleton-loader>
              </v-fade-transition>
            </v-col>
            <v-col cols="10" sm="8" md="8">
              <v-row justify="start" dense>
                <v-fade-transition mode="out-in">
                  <v-col v-if="person" cols="auto">
                    <v-card-title class="headline">
                      {{ givenName }}
                    </v-card-title>
                    <v-card-subtitle>
                      {{ $route.params.id }}
                    </v-card-subtitle>
                  </v-col>
                  <v-col v-else cols="6">
                    <v-skeleton-loader type="text@2" width="100%"></v-skeleton-loader>
                  </v-col>
                </v-fade-transition>
                <v-spacer></v-spacer>
                <v-fade-transition mode="out-in">
                  <v-col v-if="person" cols="auto" align-self="center">
                    <v-btn
                      v-if="isLocal"
                      rounded
                      color="purple"
                      @click="$store.dispatch('user/LOGOUT')"
                    >Sign Out</v-btn>
                    <v-btn
                      v-else
                      rounded
                      :color="(isFriend) ? 'red lighten-1': 'green lighten-1'"
                      @click="addOrRemove"
                    >
                      {{ (isFriend) ? '- Remove Friend' : '+ Add Friend' }}
                    </v-btn>
                  </v-col>
                  <v-col v-else cols="auto">
                    <v-skeleton-loader type="button"></v-skeleton-loader>
                  </v-col>
                </v-fade-transition>
                <v-col cols="12">
                  <v-divider></v-divider>
                </v-col>
                <v-col cols="12">
                  <v-fade-transition mode="out-in">
                    <v-card-text v-if="person">
                      {{ description }}
                    </v-card-text>
                    <v-skeleton-loader v-else type="paragraph"></v-skeleton-loader>
                  </v-fade-transition>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
          <v-divider></v-divider>
          <v-row justify="center" dense>
            <v-spacer></v-spacer>
            <v-col cols="auto">
              <v-card-actions v-if="isFriend">
                <v-btn @click="showExpense">Add Expense</v-btn>
              </v-card-actions>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>

export default {
  middleware: 'auth',
  data () {
    return {
      imageLoaded: false
    }
  },
  computed: {
    isLocal () {
      if (this.userData) {
        return this.$route.params.id === this.userData.username
      } else {
        return false
      }
    },
    isFriend () {
      return !this.isLocal &&
        this.$store.state.friends.friends &&
        this.$store.state.friends.friends.includes(this.$route.params.id)
    },
    userData () {
      return this.$store.state.user.userData
    },
    person () {
      if (this.userData) {
        if (this.isLocal) {
          return this.$store.state.user.person
        } else {
          const profile = this.$store.state.friends.loadedFriends.filter(elem => elem.username === this.$route.params.id)
          // return (profile.length > 0) ? profile[0] : ''
          if (profile.length > 0) {
            return profile[0]
          } else {
            this.$store.dispatch('friends/LOAD_PROFILE', this.$route.params.id)
            return ''
          }
        }
      } else {
        return ''
      }
    },
    description () {
      return (this.person) ? this.person.description() : ''
    },
    givenName () {
      return (this.person) ? this.person.name() : this.$route.params.id
    },
    avatarUrl () {
      if (this.person) {
        return this.person.avatarUrl() || 'https://s3.amazonaws.com/onename/avatar-placeholder.png'
      } else {
        return ''
      }
    }
  },
  methods: {
    addOrRemove () {
      if (this.isFriend) {
        this.$store.dispatch('friends/REMOVE_FRIEND', this.$route.params.id)
      } else {
        this.$store.dispatch('friends/ADD_FRIENDS', { friends: [this.$route.params.id], loadProfiles: false })
      }
    },
    showExpense () {
      this.$store.commit('M_EXPENSE_DIALOG', { show: true, splitWith: [this.$route.params.id] })
    },
    loadImage () {
      const image = new Image()
      image.onload = () => {
        console.log('image load')
        this.imageLoaded = true
      }
      image.src = this.avatarUrl
    }
  },
  watch: {
    avatarUrl () {
      this.loadImage()
    }
  },
  created () {
    if (this.$store.state.friends.friends.length === 0) {
      this.$store.dispatch('friends/LOAD_FRIENDS')
    }
    if (this.avatarUrl) {
      this.loadImage()
    }
  }
}
</script>
