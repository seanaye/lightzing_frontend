<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12">
        <v-progress-linear indeterminate :active="$store.state.payment.isLoading > 0">
        </v-progress-linear>
        <div v-if="noPayments">
          You have not posted any payments yet. Follow other users and post payments to track expenses.
        </div>
        <v-list v-else three-line :color="color">
          <v-slide-y-transition group mode="out-in">
            <template v-for="(payment, i) in payments">
              <v-list-item
                :key="i * 2 + 1"
                @click="$router.push(`/user/${payment.poster}`)"
              >
                <v-list-item-avatar>
                  <v-img :src="payment.avatarUrl" />
                </v-list-item-avatar>
                <v-list-item-content>
                  <v-list-item-title>
                    {{payment.from}} owes {{payment.to}} {{payment.amount}} {{payment.currency}}
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    posted by {{payment.poster}} at {{ new Date(payment.time) }}
                  </v-list-item-subtitle>
                </v-list-item-content>
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
    color: String
  },
  data () {
    return {
      loadingStarted: false
    }
  },
  computed: {
    noPayments () {
      return this.payments.length === 0 && this.loadingStarted && this.$store.state.payment.isLoading === 0
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
      return this.$store.state.payment.isLoading
    }
  },
  watch: {
    isLoading () {
      this.loadingStarted = true
    }
  }
}
</script>
