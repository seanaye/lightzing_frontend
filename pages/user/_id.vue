<template>
  <UserProfile :id="$route.params.id"></UserProfile>
</template>

<script>
import UserProfile from '~/components/UserProfile'

export default {
  components: {
    UserProfile
  },
  middleware: 'auth'
}
</script>
