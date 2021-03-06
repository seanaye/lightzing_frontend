<template>
  <v-container>
    <v-row justify="space-around" dense>
      <v-col cols="12" sm="3" lg="2" class="text-center" @click="showQR = !showQR">
        <v-fade-transition mode="out-in">
          <v-tooltip
            bottom
            v-if="imageLoaded && !showQR"
          >
            <template v-slot:activator="{ on }">
              <v-avatar
                size="150"
                class="ma-md-4 pt-5"
                key="avatar"
                v-on="on"
              >
                <img :src="avatarUrl">
              </v-avatar>
            </template>
            <span>Click to share QR code</span>
          </v-tooltip>
          <vue-qr
            v-else-if="imageLoaded && showQR"
            :size="150"
            class="pt-5"
            :text="`lightzing.me/user/${id}`"
            :margin="10"
            key="qr"
          ></vue-qr>
          <v-skeleton-loader
            v-else
            type="image"
            class="ma-md-4 pt-5"
            key="loader"
          />
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
                {{ id }}
              </v-card-subtitle>
            </v-col>
            <v-col v-else cols="6">
              <v-skeleton-loader type="text@2" width="100%" />
            </v-col>
          </v-fade-transition>
          <v-spacer />
          <v-fade-transition mode="out-in">
            <v-col v-if="person" cols="auto" align-self="center">
              <v-btn
                v-if="isLocal"
                rounded
                color="warning"
                @click="$store.dispatch('user/LOGOUT')"
              >
                Sign Out
              </v-btn>
              <v-btn
                v-else
                rounded
                :color="(isFriend) ? 'error': 'success'"
                @click="addOrRemove"
              >
                {{ (isFriend) ? '- Unfollow' : '+ Follow' }}
              </v-btn>
            </v-col>
            <v-col v-else cols="auto">
              <v-skeleton-loader type="button" />
            </v-col>
          </v-fade-transition>
          <v-col cols="12">
            <v-divider />
          </v-col>
          <v-col cols="12">
            <v-fade-transition mode="out-in">
              <v-card-text v-if="person">
                {{ description }}
              </v-card-text>
              <v-skeleton-loader v-else type="paragraph" />
            </v-fade-transition>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
    <v-divider />
    <v-row v-if="!isLocal" justify="center" dense>
      <v-spacer />
      <v-col cols="auto">
        <v-card-actions>
          <v-tooltip bottom :disabled="isFriend">
            <template v-slot:activator="{ on }">
              <div v-on="on">
                <v-btn :disabled="!isFriend" @click="showExpense">
                  Add Expense
                </v-btn>
              </div>
            </template>
            <span>Follow this user to split expenses</span>
          </v-tooltip>
        </v-card-actions>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import VueQr from 'vue-qr'

export default {
  components: {
    VueQr
  },
  props: {
    id: String
  },
  data () {
    return {
      imageLoaded: false,
      showQR: false
    }
  },
  computed: {
    isLocal () {
      if (this.userData) {
        return this.id === this.userData.username
      } else {
        return false
      }
    },
    isFriend () {
      return !this.isLocal &&
        this.$store.state.friends.friends &&
        this.$store.state.friends.friends.includes(this.id)
    },
    userData () {
      return this.$store.state.user.userData
    },
    person () {
      if (this.userData) {
        if (this.isLocal) {
          return this.$store.state.user.person
        } else {
          const profile = this.$store.state.friends.loadedProfiles.filter(elem => elem.username === this.id)
          // return (profile.length > 0) ? profile[0] : ''
          if (profile.length > 0) {
            return profile[0]
          } else {
            this.$store.dispatch('friends/LOAD_PROFILE', this.id)
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
      if (this.person) {
        return this.person.name() || this.id
      } else {
        return this.id
      }
    },
    avatarUrl () {
      if (this.person) {
        return this.person.avatarUrl() || 'https://s3.amazonaws.com/onename/avatar-placeholder.png'
      } else {
        return ''
      }
    }
  },
  watch: {
    avatarUrl () {
      this.loadImage()
    },
    userData () {
      this.loadData()
    }
  },
  created () {
    this.loadData()
  },
  methods: {
    addOrRemove () {
      if (this.isFriend) {
        this.$store.dispatch('friends/REMOVE_FRIEND', this.id)
      } else {
        this.$store.dispatch('friends/ADD_FRIENDS', { friends: [this.id], loadProfiles: false })
      }
    },
    showExpense () {
      const splitWith = this.$store.state.splitWith
      this.$store.commit('M_EXPENSE_DIALOG', { show: true, splitWith: splitWith.concat(this.id) })
      this.$router.push('/newexpense')
    },
    loadImage () {
      const image = new Image()
      image.onload = () => {
        this.imageLoaded = true
      }
      image.src = this.avatarUrl
    },
    loadData () {
      if (this.$store.state.friends.friends.length === 0 && this.userData) {
        this.$store.dispatch('friends/LOAD_FRIENDS', { loadProfiles: false })
      }
      if (this.avatarUrl && !this.imageLoaded) {
        this.loadImage()
      }
    }
  }
}
</script>
