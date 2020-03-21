import Vue from 'vue'
import Vuex from 'vuex'
import auth from './modules/auth.js'
import pois from './modules/pois.js'
import map from './modules/map.js'
import messages from './modules/messages'
import routes from './modules/routes'
import articles from './modules/articles'

import createLogger from '../plugins/logger'

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
  modules: {
    auth,
    routes,
    map,
    articles,
    pois,
    messages
  },
  strict: debug,
  plugins: debug ? [createLogger()] : []
})
