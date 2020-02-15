import { Schema, ContentTypes } from "@/store/modules/pois.js";
import i18n from '@/plugins/i18n';

export const RouteSchema = {
  poiIds: []
}

export const state = () => {
  return {
    routes: [],
    currentRoute: null
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
  initRoutes: async function ({ state, commit, dispatch}) {
    const ref = await this.$app.$firebase.firestore().collection('routes')
    
    // causes lots of read/writes for routes... 
    ref.onSnapshot((snapShot) => {
      commit('setRoutes', [])
      snapShot.forEach((route) => {
        const r = route.data()
        r.id = route.id
        commit('createRoute', r)
      })
      if(state.routes.length === 0) {
        dispatch('createRoute', {})
      }
    })
  },
  async createRoute ({ commit, state }, route) {
    const ref = await this.$app.$firebase.firestore().collection('routes').doc()
    const date = this.$app.$firebase.firestore.Timestamp.fromDate(new Date('1945-04-11'))
    const newRoute = {
      id: ref.id,
      date: date,
      title: route.title == null ? i18n.t('marker.title', { 'length': state.routes.length }) : route.title,
      description: route.description == null ? i18n.t('marker.description', { 'length': state.routes.length }) : route.description
    }

    commit('createRoute', newRoute)
  },
}
export const mutations = {
 createRoute (state,  route ) {
    const newRoute = Object.assign({}, Schema, RouteSchema, route)
    console.log('created route', newRoute)
    state.routes.push(newRoute)
  },
  setCurrentRoute (state, val) {
    // validate route
    console.log('setcurrent', val)
    state.currentRoute = val
  },
  setRoutes(state, routes) {
    state.routes = routes
  }
}


export default {
  state,
  getters,
  actions,
  mutations,
  Schema
}
