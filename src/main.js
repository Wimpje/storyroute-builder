import Vue from 'vue'
import vuetify from './plugins/vuetify'
import i18n from './plugins/i18n'

import App from '@/App.vue'
import router from '@/router'
import store from '@/store'
import VueCookies from 'vue-cookies'
import firebase from './plugins/firebase'
import * as VueGoogleMaps from 'vue2-google-maps'
Vue.config.devtools = true
// Cookies
Vue.use(VueCookies)
Vue.$cookies.config('1h')

// googlemaps
Vue.use(VueGoogleMaps, {
  load: {
    key: process.env.VUE_APP_GOOGLE_MAPS_API_KEY,
    libraries: 'places',
    region: 'NL',
    language: 'nl'
  },
 
  //// If you intend to programmatically custom event listener code
  //// (e.g. `this.$refs.gmap.$on('zoom_changed', someFunc)`)
  //// instead of going through Vue templates (e.g. `<GmapMap @zoom_changed="someFunc">`)
  //// you might need to turn this on.
  // autobindAllEvents: false,
 
  //// If you want to manually install components, e.g.
  //// import {GmapMarker} from 'vue2-google-maps/src/components/marker'
  //// Vue.component('GmapMarker', GmapMarker)
  //// then disable the following:
  // installComponents: true,
})

Vue.use(firebase)


// only load app when user state is determined (logged in / not logged in)
let app = '';
firebase.auth().onAuthStateChanged(user => {
  console.log('auth state changed, user = ', user)
  store.dispatch("set", user)
  if(!app){
   app = new Vue({
      router,
      store,
      vuetify,
      firebase,
      i18n,
      render: h => h(App)
    })
    // make this.$firebase etc accessible in stores
    store.$app = app;
    app.$mount('#app')
  }
  Vue.config.devtools = true
  
});
