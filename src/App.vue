<template>
  <v-app dark>
    <v-navigation-drawer
      v-model="drawer"
      app
    >
      <v-list>
        <v-list-item
          v-for="(item, i) in items"
          :key="i"
          :to="item.to"
          router
          exact
        >
          <v-list-item-action>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title v-text="item.title" />
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

      <v-toolbar-title v-text="title" />
      <v-spacer />
    </v-app-bar>
    <v-content>
      <v-container fluid>
        <router-view />
      </v-container>
    </v-content>
    <v-footer
      :fixed="fixed"
      app
    >
      <v-snackbar v-model="messages">
        {{ messages }}
        <v-btn
          color="pink"
          text
          @click="messages = ''"
        >
          Close
        </v-btn>
      </v-snackbar>
      <span>&copy; 2019 - nosmallthing.nl</span>
    </v-footer>
  </v-app>
</template>

<script>
export default {
  data() {
    return {
      clipped: false,
      drawer: false,
      fixed: false,
      miniVariant: true
    };
  },
  computed: {
    user() {
      return (this.$store.state.auth || {}).user || null;
    },
    messages: {
      get() {
        return this.$store.state.messages.message
      },
      set(value) {
        return this.$store.commit("setMessage", value);
      }
    },
    title() {
      return this.user
        ? this.$t("title.loggedIn", { user: this.user.name })
        : this.$t("title.loggedOut");
    },
    items() {
      return [
        {
          icon: "mdi-apps",
          title: "Home",
          to: "/"
        },
        {
          icon: "mdi-login",
          title: this.user ? "Log out" : "Log in",
          to: '/user'
        },
        {
          icon: "mdi-help",
          title: "Help",
          to: "/help"
        }
      ];
    }
  }
};
</script>
