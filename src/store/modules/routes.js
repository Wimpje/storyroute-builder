import { Schema, UrlSchema, FileSchema, ContentTypes } from "@/store/modules/pois.js";
import i18n from '@/plugins/i18n';

export const RouteSchema = {
  pois: []
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
    const newRoute = {
      ...RouteSchema,
      id: ref.id,
      title: route.title == null ? i18n.t('marker.title', { 'length': state.routes.length }) : route.title,
      description: route.description == null ? i18n.t('marker.description', { 'length': state.routes.length }) : route.description
    }

    commit('createRoute', newRoute)
    commit('setCurrentRoute', newRoute)

  },
  async saveRoute({commit}, route) {
    if (!route.savedDate) {
      route.updatedDate = this.$app.$firebase.firestore.FieldValue.serverTimestamp()
      if (route.updateCnt != null)
        route.updateCnt = route.updateCnt++
      else
        route.updateCnt = 1
    }
    const user = (this.$app.$store.state.auth || {}).user
    route.author = user.email ? user.email : ''
    // console.log('saving poi: (NOT REALLY, commented out in dev mode)', poi)
    await this.$app.$firebase.firestore().collection('routes').doc(route.id).set({ ...route, saved: true, savedDate: this.$app.$firebase.firestore.FieldValue.serverTimestamp()})
 
    commit('saveRoute', route)
    // TODO i18n
    commit('setMessage', {title: 'Route Saved', message:`The route ${route.title} has been saved`})
  },
 
  addNewFileToRoute({commit}) {
    commit('addNewFileToRoute', Object.assign({}, FileSchema))
   },
   addNewUrlToRoute({commit}) {
    commit('addNewUrlToRoute', Object.assign({}, UrlSchema))
   },
   deleteFileFromRoute({commit}, payload){
     commit('deleteFileFromRoute', payload)
   },
   deleteUrlFromRoute({commit}, payload){
     commit('deleteUrlFromRoute', payload)
   }, 
   updateUrlFromRoute({commit}, payload){
     commit('updateUrlFromRoute', payload)
   },
   updateFileFromRoute({commit}, payload){
     commit('updateFileFromRoute', payload)
   },
   async removeCurrentRoute ({ commit, state }) {
    if (state.currentRoute === null) { return }
    const r = state.currentRoute
    if (state.currentRoute.saved) {
      // delete from firebase too
      const ref = await this.$app.$firebase.firestore().collection('routes').doc(r.id).delete()
      console.log(ref)
    }
    commit('removeCurrentRoute')
  }
}
export const mutations = {
 createRoute (state,  route ) {
    const newRoute = Object.assign({}, Schema, RouteSchema, route)
    console.log('created route', newRoute)
    state.routes.push(newRoute)
  },
  setCurrentRoute (state, val) {
    // validate route
    console.log('setCurrentRoute', val)
    state.currentRoute = val
  },
  setRoutes (state, routes) {
    state.routes = routes
  },
  saveRoute (state, route) {
    state.currentRoute = route
  },
  addNewFileToRoute (state, fileObject) {
    if (state.currentRoute.files)
      state.currentRoute.files.push(fileObject)
    else 
      state.currentRoute.files = [fileObject]
  },
  addNewUrlToRoute (state, urlObject) {
    if(state.currentRoute.urls)
      state.currentRoute.urls.push(urlObject)
    else 
      state.currentRoute.urls = [urlObject]
  },
  deleteFileFromRoute(state, payload) {
    console.log('MUTATION: deleting file', payload)
    state.currentRoute.files.splice(payload.index, 1)
  },
  deleteUrlFromRoute(state, payload) {
    console.log('MUTATION: deleting url', payload)
    state.currentRoute.urls.splice(payload.index, 1)
  },
  updateUrlFromRoute(state, payload) {
    console.log('MUTATION: updating url', payload)
    state.currentRoute.urls[payload.index] = Object.assign({}, state.currentRoute.urls[payload.index], payload.val)
  },
  updateFileFromRoute(state, payload) {
    console.log('MUTATION: updating file', payload)
    state.currentRoute.files[payload.index] = Object.assign({}, state.currentRoute.files[payload.index], payload.val)
  },
  addPoiToRoute(state, payload) {
    if (state.currentRoute) {
      const existingPoi = state.currentRoute.pois.filter((poi) => payload.id === poi.id)
      if(existingPoi.length > 0) {
        this.$app.$store.commit('setMessage', {title: 'POI already added to route', message:`This point is already part of the route, to delete it click the button on the side`}) // TODO better implementation
      }
      else {
        state.currentRoute.pois.push(payload)
      }
    }
    else
      this.$app.$store.commit('setMessage', {title: 'Error adding POI', message:`No route selected yet! Cannot add this Point`}) // TODO better implementation
  },
  removePoiFromRoute(state, payload) {
    const idx = state.currentRoute.pois.findIndex((p) => p.id === payload.id)
    console.log('removing poi', idx)
    state.currentRoute.pois.splice(idx, 1)
  },
  setCurrentRouteToNone(state) {
    state.currentRoute = null
  },
  removeCurrentRoute(state, payload) {
    if (state.currentRoute === null) { return }
    state.routes = state.routes.filter(r => r.id !== state.currentRoute.id)
    state.currentRoute = null
  },
  updateCurrentRoutePois(state, payload) {
    console.log('MUTATION - updateCurrentRoute pois order', payload)
    state.currentRoute.pois = payload
  },
}


export default {
  state,
  getters,
  actions,
  mutations,
  Schema
}
