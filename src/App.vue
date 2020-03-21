<template>
  <v-app dark>
    <v-navigation-drawer
      permanent
      expand-on-hover
      app
      dark
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
      flat
      app
      dark
    >
      <v-toolbar-title v-text="title" />
      <v-spacer />
    </v-app-bar>
    <v-content>
      <v-container fluid>
        <router-view />
      </v-container>
    </v-content>
    <v-footer
      app
      dark
    >
      <v-snackbar v-model="toastShow">
        <h3>{{ toastTitle }}</h3>
        <span>&nbsp;</span>
        <div>{{ toastMessage }}</div>
        <v-btn
          color="pink"
          text
          @click="toastShow = false"
        >
          Close
        </v-btn>
      </v-snackbar>
      <span v-text="footerTitle" />
    </v-footer>
  </v-app>
</template>

<script>
import router from '@/router'

export default {
  data() {
    return {
      toastShow: false,
      toastTitle: '',
      toastMessage: '',
    };
  },
  computed: {
    user() {
      return (this.$store.state.auth || {}).user || null;
    },
    title: function () {
      return this.$route.name
    },
    footerTitle() {
      return this.user
        ? this.$t("title.loggedIn", { user: this.user.name })
        : this.$t("title.loggedOut");
    },
    items() {
      return [
        {
          icon: "mdi-home",
          title: "Home",
          to: "/"
        },
        {
          icon: "mdi-map-outline",
          title: "Routes",
          to: "/routes"
        },
        {
          icon: "mdi-map-marker",
          title: "Points",
          to: "/points"
        },
        {
          icon: "mdi-newspaper-variant-multiple-outline",
          title: "Articles",
          to: "/articles"
        },
        {
          icon: "mdi-login",
          title: this.user ? "Log out" : "Log in",
          to: '/user'
        }
      ];
    }
  },
  created() {
    const state = this
    this.$store.subscribe((mutation, s) => {
      if (mutation.type === 'setMessage') {
        state.toastMessage = this.$store.state.messages.message
        state.toastTitle = this.$store.state.messages.title
        state.toastShow  = typeof state.toastMessage !== 'undefined' && state.toastMessage != null && state.toastMessage.length > 0
      }
    })
    // get stuff from firebase once, it is 'active' (onsnapshot promise)
    this.$store.dispatch("initPois")
    this.$store.dispatch("initRoutes")
  }
};
</script>
