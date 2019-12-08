<template>
  <v-overlay :value="debouncedValue">
    <v-container>
      <v-row justify="center">
        <transition name="bounce" mode="out-in">
          <v-progress-circular v-if="successFail === 0" indeterminate size="64">
          </v-progress-circular>
          <v-icon v-else-if="successFail === 1">mdi-check-bold</v-icon>
          <v-icon v-else-if="successFail === -1">mdi-close</v-icon>
        </transition>
      </v-row>
      <v-row class="pt-3">
        <div>{{text}}</div>
      </v-row>
    </v-container>
  </v-overlay>
</template>

<script>
export default {
  props: {
    value: Boolean,
    redirect: String,
    successFail: Number
  },
  data () {
    return {
      debouncedValue: false
    }
  },
  created () {
    this.debouncedValue = this.value
  },
  watch: {
    value () {
      if (this.value) {
        this.debouncedValue = this.value
      } else {
        setTimeout(() => {
          this.debouncedValue = this.value
          this.$router.push(this.redirect)
        }, 2000)
      }
    }
  },
  computed: {
    text () {
      if (this.value && this.successFail === 0) {
        return 'Posting Payment'
      } else if (this.successFail === 1) {
        return 'Post Successful'
      } else if (this.successFail === -1) {
        return 'Post Failure'
      } else {
        return ''
      }
    }
  }
}
</script>

<style scoped>
.bounce-enter-active {
    animation: bounce-in .5s;
}
.bounce-leave-active {
    animation: bounce-in .5s reverse;
}
@keyframes bounce-in {
    0% {
      transform: scale(0);
    }
    50% {
      transform: scale(1.5);
    }
    100% {
      transform: scale(1);
    }
}
</style>
