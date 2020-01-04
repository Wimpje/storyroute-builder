/* eslint-disable no-console */
<template>
  <v-container>
    <v-col
      v-if="!user"
      text-xs-center
      xs12
      sm6
    >
      <h2 class="title">
        Sign In with Google
      </h2>
      <v-btn
        class="logIn mb-2"
        primary
        @click.native="googleSignUp"
      >
        Google Sign In
      </v-btn>
    </v-col>
    <v-col v-if="user">
      <h2>Hi {{ user.name }}!</h2>
      <v-img
        :src="user.avatar"
        aspect-ratio="1"
        max-width="100px"
      />
      <v-btn
        class="signOut mb-2"
        primary
        @click.native="signOut"
      >
        Sign Out
      </v-btn>
    </v-col>
  </v-container>
</template>

<script>
export default {
  data () {
    return {
      formEmail: '',
      formPassword: ''
    }
  },
  computed: {
    user () {
      return (this.$store.state.auth || {}).user || null
    }
  },
  methods: {
    googleSignUp () {
      this.$store
        .dispatch('googleSignIn')
        .then(() => {
          console.log('inside then statement on login')
        })
        .catch((e) => {
          console.log(e.message)
        })
    },
    signOut () {
      this.$store.dispatch('googleSignOut').then(() => {
        console.log('signed out')
      })
    }
  }
}
</script>

<style lang="css">
</style>
