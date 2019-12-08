<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12">
        <v-card>
          <v-row justify="center" no-gutters>
            <v-card-title>
              You're almost there...
            </v-card-title>
            <v-card-text>
              <p>
                This app requires a blockstack ID to function. Blockstack is a decentralized profile you can create in 30 seconds and holds data that you exclusively own. No strings attached.
                <br>
                Create or login to your blockstack ID below
              </p>
            </v-card-text>
            <v-card-actions style="width: 100%;">
              <v-row justify="center" no-gutters>
                <v-col cols="12" md="8" lg="6">
                  <v-btn
                    block
                    color="blue"
                    :loading="redirecting"
                    @click="signIn"
                  >
                    Sign Up/Login
                  </v-btn>
                </v-col>
              </v-row>
            </v-card-actions>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
export default {
  middleware: 'signin',
  data () {
    return {
      redirecting: false
    }
  },
  methods: {
    signIn () {
      this.redirecting = true
      if (!this.$store.state.user.userSession) {
        this.$store.commit('user/CREATE_SESSION')
      }
      const url = this.$store.state.user.redirect || '/dashboard'
      console.log({ url })
      this.$store.state.user.userSession.redirectToSignIn(window.location.origin + url)
    }
  }
}
</script>
