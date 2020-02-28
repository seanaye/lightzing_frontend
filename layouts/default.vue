<template>
  <v-app dark>
    <v-navigation-drawer
      v-model="drawer"
      :clipped="clipped"
      fixed
      app
    >
      <v-list>
        <v-list-item>
          <v-list-item-avatar>
            <v-icon>mdi-theme-light-dark</v-icon>
          </v-list-item-avatar>
          <v-list-item-content>
            Dark mode
          </v-list-item-content>
          <v-list-item-action>
            <v-switch
              v-model="darkMode"
              :color="(darkMode) ? 'blue' : ''"
            >
            </v-switch>
          </v-list-item-action>
        </v-list-item>
        <v-divider></v-divider>
        <v-list-item
          v-for="(item, i) in items"
          :key="i"
          :to="item.to"
          router
          exact
        >
          <v-list-item-avatar>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title v-text="item.title" />
          </v-list-item-content>
        </v-list-item>
        <v-divider></v-divider>
        <v-list-item
          v-for="friend in friends"
          :key="friend"
          :to="`/user/${friend}`"
          router
          exact
        >
          <v-list-item-avatar>
            <v-icon>mdi-account</v-icon>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title v-text="friend" />
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
    <v-app-bar
      :clipped-left="clipped"
      fixed
      app
    >
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" />
      <v-toolbar-title>
        {{title}}
        <v-icon>mdi-flash</v-icon>
      </v-toolbar-title>
    </v-app-bar>
    <v-content>
      <nuxt />
    </v-content>
    <v-footer
      :fixed="fixed"
      app
    >
      <span>&copy; 2019</span>
    </v-footer>
  </v-app>
</template>

<script>

export default {
  data () {
    return {
      clipped: true,
      drawer: null,
      fixed: false,
      items: [
        {
          icon: 'mdi-apps',
          title: 'Welcome',
          to: '/'
        },
        {
          icon: 'mdi-account',
          title: 'My Dashboard',
          to: '/dashboard'
        },
        {
          icon: 'mdi-plus',
          title: 'New Payment',
          to: '/newexpense'
        }
      ],
      title: 'lightzing.me'
    }
  },
  computed: {
    darkMode: {
      get () {
        return this.$vuetify.theme.dark
      },
      set (value) {
        this.$vuetify.theme.dark = value
      }
    },
    friends () {
      return this.$store.state.friends.friends
    }
  },
  created () {
    if (this.$store.state.friends.friends.length === 0 && this.userData) {
      this.$store.dispatch('friends/LOAD_FRIENDS', { loadProfiles: false })
    }
  }
}
</script>
