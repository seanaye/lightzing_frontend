<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" sm="10">
        <v-card elevation="12" color="blue darken-2">
          <UserProfile :id="$route.params.id"></UserProfile>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import UserProfile from '~/components/UserProfile'

export default {
  components: {
    UserProfile
  },
  middleware: 'auth',
  transition: {
    name: 'fade-transition',
    mode: 'out-in'
  }
}
</script>
