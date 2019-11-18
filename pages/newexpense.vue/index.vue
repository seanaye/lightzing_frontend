<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12">
        <ExpenseCard></ExpenseCard>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import ExpenseCard from '~/components/ExpenseCard'

export default {
  components: {
    ExpenseCard
  },
  middleware: 'auth',
  transition: {
    name: 'fade-transition',
    mode: 'out-in'
  }
}
</script>
