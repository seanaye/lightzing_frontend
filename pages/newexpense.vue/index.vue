<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12">
        <v-card color="primary">
          <ExpenseCard color="primary" />
        </v-card>
      </v-col>
    </v-row>
    <LoadingOverlay
      :value="$store.state.payment.isPosting"
      redirect="/dashboard"
      :successFail="$store.state.payment.postSuccessFail"
    >
    </LoadingOverlay>
  </v-container>
</template>
<script>
import ExpenseCard from '~/components/ExpenseCard'
import LoadingOverlay from '~/components/LoadingOverlay'

export default {
  components: {
    ExpenseCard,
    LoadingOverlay
  },
  middleware: 'auth',
  transition: {
    name: 'fade-transition',
    mode: 'out-in'
  },
  created () {
    this.loadAll()
  },
  methods: {
    async loadAll () {
      await this.$store.dispatch('friends/LOAD_FRIENDS', { loadProfiles: true })
    }
  }
}
</script>
