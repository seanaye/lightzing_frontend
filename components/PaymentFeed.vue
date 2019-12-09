<template>
  <v-container fluid>
    <v-row justify="center">
      <v-slide-y-transition mode="out-in">
        <v-row justify="center">
          <v-col cols="4" style="text-align: center;">
            You are owed<br>${{$store.getters['payment/totalReceivable']}}
          </v-col>
          <v-col cols="4" style="text-align: center;">
            You owe<br>${{$store.getters['payment/totalPayable']}}
          </v-col>
          <v-col cols="4"  style="text-align: center;">
            Total
            <br>
            {{($store.getters['payment/netAmount'] >= 0) ? '+' : '-'}}
            ${{Math.abs($store.getters['payment/netAmount'])}}
          </v-col>
        </v-row>
      </v-slide-y-transition>
      <v-col cols="12">
        <v-progress-linear indeterminate :active="isLoading" color="accent">
        </v-progress-linear>
        <div v-if="noPayments">
          You have not posted any payments yet. Follow other users and post payments to track expenses.
        </div>
        <v-list v-if="!noPayments" three-line :color="color" >
          <v-divider></v-divider>
          <v-slide-y-transition group mode="out-in">
            <template v-for="(payment, i) in payments">
              <v-list-item
                :key="i * 2 + 1"
              >
                <v-tooltip bottom>
                  <template v-slot:activator="{ on }">
                    <v-list-item-avatar @click="$router.push(`/user/${payment.poster}`)">
                      <v-img :src="payment.avatarUrl" v-on="on"/>
                    </v-list-item-avatar>
                  </template>
                  Go to profile
                </v-tooltip>
                <v-list-item-content>
                  <v-list-item-title>
                    {{fromToString(payment.from, payment.to)}}
                    {{(payment.currency === 'USD') ? '$' : ''}}{{payment.amount}}
                    {{(payment.currency !== 'USD') ? payment.currency : ''}}
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    Description: {{payment.desc}},
                    Posted by: {{payment.poster}} at {{ new Date(payment.time) }}
                  </v-list-item-subtitle>
                </v-list-item-content>
                <v-list-item-action>
                  <v-tooltip v-if="payment.poster === myUsername" bottom>
                    <template v-slot:activator="{ on }">
                      <v-btn
                        icon
                        @click="remove(payment.poster, payment.from, payment.index)"
                      >
                        <v-icon v-on="on">mdi-close</v-icon>
                      </v-btn>
                    </template>
                    Delete post
                  </v-tooltip>
                  <v-tooltip v-if="payment.from === myUsername" bottom>
                    <template v-slot:activator="{ on }">
                      <v-btn icon>
                        <v-icon v-on="on">mdi-flash</v-icon>
                      </v-btn>
                    </template>
                    Pay
                  </v-tooltip>
                </v-list-item-action>
              </v-list-item>
              <v-divider :key="i * 2" />
            </template>
          </v-slide-y-transition>
        </v-list>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  props: {
    color: String,
    poster: {
      required: false,
      default: '',
      type: String
    }
  },
  data () {
    return {
      loadingStarted: false
    }
  },
  computed: {
    noPayments () {
      return this.payments.length === 0 && this.loadingStarted && !this.isLoading
    },
    payments () {
      return this.$store.getters['payment/sortedPayments'].map((elem) => {
        let avatarUrl = ''
        if (elem.poster === this.$store.getters['user/userObj'].username) {
          avatarUrl = this.$store.getters['user/userObj'].avatarUrl
        } else {
          for (const friend of this.$store.getters['friends/loadedFriendsObj']) {
            if (elem.poster === friend.username) {
              avatarUrl = friend.avatarUrl
              break
            }
          }
        }
        elem.avatarUrl = avatarUrl
        return elem
      })
    },
    isLoading () {
      return this.$store.state.payment.isLoading > 0 || this.$store.state.friends.isLoading > 0
    },
    myUsername () {
      return this.$store.getters['user/userObj'].username
    }
  },
  watch: {
    isLoading () {
      this.loadingStarted = true
    }
  },
  methods: {
    fromToString (from, to) {
      return `${(from === this.myUsername) ? 'You owe ' : from + ' owes'}
        ${(to === this.myUsername) ? 'you' : to}`
    },
    async remove (poster, postee, index) {
      console.log({ poster, postee, index })
      await this.$store.dispatch('payment/REMOVE_PAYMENT', { poster, postee, index })
    }
  }
}
</script>
