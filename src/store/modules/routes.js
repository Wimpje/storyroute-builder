import { Schema, UrlSchema, FileSchema, ContentTypes } from "@/store/modules/pois.js";
import i18n from '@/plugins/i18n';
import { deepCopy } from '@/plugins/utils'

export const RouteSchema = {
  subtitle: '',
  pois: [],
  files: [],
  urls: [],
  path: []
}

export const state = () => {
  return {
    routes: [],
    currentRoute: null
  }
}
export const getters = {
  currentRoute(state) {
    return state.currentRoute
  },
  getRoutes(state) {
    return state.routes
  }
}

export const actions = {
  initRoutes: async function ({ state, commit, dispatch }) {
    const ref = await this.$app.$firebase.firestore().collection('routes')
    commit('setRoutes', [])

    ref.onSnapshot((snapShot) => {
      snapShot.docChanges().forEach((change) => {
        console.log(`FB:${change.type}:route`, change.doc.id)
        if (change.type !== "removed") {
          const r = change.doc.data()
          r.id = change.doc.id
          commit('updateRoute', r)
        }
      })
    })
  },
  async createRoute({ commit, state }, route) {
    const ref = await this.$app.$firebase.firestore().collection('routes').doc()
    let schema = deepCopy(RouteSchema)
    const newRoute = Object.assign({}, schema, {
      id: ref.id,
      title: route.title == null ? i18n.t('marker.title', { 'length': state.routes.length }) : route.title,
      description: route.description == null ? i18n.t('marker.description', { 'length': state.routes.length }) : route.description
    })

    commit('addRoute', newRoute)
    commit('setCurrentRoute', newRoute)
  },
  async saveRoute({ rootState, commit }, route) {
    if (route.savedDate) {
      route.updatedDate = this.$app.$firebase.firestore.FieldValue.serverTimestamp()
      if (route.updateCnt != null)
        route.updateCnt = route.updateCnt+1
      else
        route.updateCnt = 1
    }
    else {
      route.savedDate = this.$app.$firebase.firestore.FieldValue.serverTimestamp()
    }
    const user = (this.$app.$store.state.auth || {}).user
    route.author = user.email ? user.email : ''

    // here we check the current Pois and re-add / save the values

    // first filter out removed pois
    route.pois = route.pois.filter(poi => {
      return rootState.pois.pois.findIndex(p => p.id == poi.id) > -1;
    })
    route.pois = route.pois.map(poi => {
      const idx = rootState.pois.pois.findIndex(p => p.id == poi.id);
      // hack, the route has a field 'routeDescription', copy this if it exists...
      return Object.assign({routeDescription: !!poi.routeDescription ? poi.routeDescription : '' }, rootState.pois.pois[idx])
    })
    // console.log('saving poi: (NOT REALLY, commented out in dev mode)', poi)
    await this.$app.$firebase.firestore().collection('routes').doc(route.id).set({ ...route, saved: true, savedDate: this.$app.$firebase.firestore.FieldValue.serverTimestamp() })

    commit('saveRoute', route)
    // TODO i18n
    commit('setMessage', { title: 'Route Saved', message: `The route ${route.title} has been saved` })
  },

  addNewFileToRoute({ commit }) {
    commit('addNewFileToRoute', Object.assign({}, FileSchema))
  },
  addNewUrlToRoute({ commit }) {
    commit('addNewUrlToRoute', Object.assign({}, UrlSchema))
  },
  deleteFileFromRoute({ commit }, payload) {
    commit('deleteFileFromRoute', payload)
  },
  deleteUrlFromRoute({ commit }, payload) {
    commit('deleteUrlFromRoute', payload)
  },
  updateUrlFromRoute({ commit }, payload) {
    commit('updateUrlFromRoute', payload)
  },
  updateFileFromRoute({ commit }, payload) {
    commit('updateFileFromRoute', payload)
  },
  async removeCurrentRoute({ commit, state }) {
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
  addRoute(state, route) {

    console.log('added route', route)
    state.routes.push(route)
  },
  setCurrentRoute(state, val) {
    // validate route
    console.log('setCurrentRoute', val)
    state.currentRoute = val
  },
  setRoutes(state, routes) {
    state.routes = routes
  },
  saveRoute(state, route) {
    state.currentRoute = route
  },
  addNewFileToRoute(state, fileObject) {
    if (state.currentRoute.files)
      state.currentRoute.files.push(fileObject)
    else
      state.currentRoute.files = [fileObject]
  },
  addNewUrlToRoute(state, urlObject) {
    if (state.currentRoute.urls)
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
      if (existingPoi.length > 0) {
        this.$app.$store.commit('setMessage', { title: 'POI already added to route', message: `This point is already part of the route, to delete it click the button on the side` }) // TODO better implementation
      }
      else {
        state.currentRoute.pois.push(payload)
      }
    }
    else
      this.$app.$store.commit('setMessage', { title: 'Error adding POI', message: `No route selected yet! Cannot add this Point` }) // TODO better implementation
  },
  updatePoiInRoute(state, payload) {
    if (state.currentRoute) {
      const idx = state.currentRoute.pois.findIndex((p) => p.id === payload.id)
      if (idx > -1) {
        // merging with existing poi
        state.currentRoute.pois[idx] = Object.assign({}, state.currentRoute.pois[idx], payload)
      }
      else {
        this.$app.$store.commit('setMessage', { title: 'Error modifying POI', message: `Could not find this point in route, very weird!` }) // TODO better implementation
      }
    }
    else
      this.$app.$store.commit('setMessage', { title: 'Error modifying POI', message: `No route selected yet! Cannot modify this Point` }) // TODO better implementation
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
  setPathToCurrentRoute(state, path) {
    state.currentRoute.path = path
  },
  updateRoute(state, route) {
    // if it exists:
    if (state.routes.findIndex(r => r.id === route.id) > -1) {
      // replace it with updated value
      state.routes.forEach(r => {
        if (r.id === route.id) {
          Object.assign(r, route)
        }
      })
    }
    else {
      // add it
      state.routes.push(route)
    }
  }
}


export default {
  state,
  getters,
  actions,
  mutations,
  Schema
}
