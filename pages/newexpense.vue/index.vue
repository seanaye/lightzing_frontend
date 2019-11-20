<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12">
        <v-card color="primary">
          <ExpenseCard color="primary"></ExpenseCard>
        </v-card>
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
