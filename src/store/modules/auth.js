/* eslint-disable no-console */


const tokenExpiry = process.env.VUE_APP_AUTH_TOKEN_EXPIRE || 1000

// also subscribe to onAuthStateChanged here



export const state = () => ({
  user: null
})

const getters = {

};

// mutations
export const mutations = {
  setUser (state, data) {
    state.user = data
  },
  setUserFromGoogleResponse (state, data) {
    state.user = createUserFromGoogleResponse(data)
  },
  clearUser (state) {
    state.user = null
  }
}

export const actions = {
  // eslint-disable-next-line object-shorthand
  set: function ({ commit }, result) {
    let data = {};
    try {
      if (!result) {
        data = window.$cookies.get('user')
        console.log('set user from $cookie:', data)
      } else {
        data = createUserFromGoogleResponse(result)

        console.log('set user from caller data:', data)
      }
      commit('setUser', data)
    } catch (err) {
      commit('clearUser')
      commit('setMessage', {title: 'Error', message: err, duration: 15000}, { root: true })

    }
  },
  // eslint-disable-next-line object-shorthand
  googleSignIn: async function ({ commit }) {
    const result = await this.$app.$firebase.auth().signInWithPopup(new this.$app.$firebase.auth.GoogleAuthProvider())
    try {
      const user = createUserFromGoogleResponse(result)
      const token = result.credential.accessToken
      commit('setUser', user)
      window.$cookies.set('user', user, { path: '/' })
      window.$cookies.set('Authorization', token, { path: '/', maxAge: tokenExpiry })
    } catch (error) {
      commit('setMessage', {title: 'Error', message:error.message, duration:15000}, { root: true })
    }
  },
  // eslint-disable-next-line object-shorthand
  googleSignOut: async function ({ commit }, payload) {
    
    try {
      await this.$app.$firebase.auth().signOut()
      // Removes user from Store
      commit('clearUser')
      window.$cookies.remove('Authorization')
      window.$cookies.remove('user')
      console.log('Logout Successful')
    } catch (error) {
      window.$cookies.remove('Authorization')
      window.$cookies.remove('user')
      console.log('Logout error', error)
    }
  }
}

const createUserFromGoogleResponse = (result) => {
  if (!result) { return null }
  const user = result.user ? result.user : result
  return { name: user.displayName, email: user.email, avatar: user.photoURL }
}


export default {
  state,
  getters,
  actions,
  mutations
}
