//import { fireStore } from 'firebase'

export const state = () => {
  return {
    routes: ['aap', 'noot', 'mies'],
    currentRoute: null,
    ref: null
  }
}
export const getters = {
  currentRoute (state) {
    return state.currentRoute
  },
  getRoutes (state) {
    return state.routes
  }
}

export const actions = {
  initRoutes: async function ({ commit }) {
    const ref = await this.$app.$firebase.firestore().collection('routes')
    
    // causes lots of read/writes for points... 
    ref.onSnapshot((snapShot) => {
      commit('setRoutes', [])
      snapShot.forEach((poi) => {
        const p = poi.data()
        p.id = poi.id
        commit('createRoute', p)
      })
    })
  },
}
export const mutations = {
  async createRoute (state, { poi }) {
    const ref = await this.$app.$firebase.firestore().collection('routes').doc()

    console.log('create', ref)
  },
  setCurrentRoute (state, val) {
    // validate poi
    console.log('setcurrent', val)
    state.currentRoute = val
  },
  setRoutes(state, routes) {
    state.routes = routes
  }
}

export const Schema = {
  id:'',
  title: '',
  description: '',
  pois: [], // string
  leadImage: '', // image for display
  urls: [],
  files:[], // {file: '', title: '', description: '', date: '', copyright: '', type:''}
  author:'', // name of point creator
  googleVoice: false // read aloud with google voice 
}

export default {
  state,
  getters,
  actions,
  mutations,
  Schema
}
