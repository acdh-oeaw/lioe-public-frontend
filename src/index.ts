import Vue from 'vue'
import App from '@components/App.vue'
import Vuex from 'vuex'
import router from '@src/router'
import VueRouter from 'vue-router'
import * as fontLoader from 'webfontloader'

import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'
// import { lineClamp } from 'vue-line-clamp-extended'
import VueLazyload from 'vue-lazyload'

import VueTour from 'vue-tour'

// useful comment here

export const $bus = new Vue();

Vue.prototype.$bus = $bus;

Vue.config.devtools = true;
Vue.config.productionTip = true
// Vue.directive('line-clamp', lineClamp)
Vue.use(Vuex)
Vue.use(VueRouter)
Vue.use(Vuetify)
const vuetifyOptions = {
  // iconfont: 'fa4',
  theme: {
    dark: window.location.hash.includes('dark'),
    themes: {
      light: {
        ci: '#3B89A0',
        primary: '#3B89A0',
        secondary: '#2C6374',
        accent: '#88DBDF'
      }
    },
    options: {
      customProperties: true,
    }
  }
}
Vue.use(VueLazyload, { lazyComponent : true })
import VueWordCloud from 'vuewordcloud'
Vue.component(VueWordCloud.name, VueWordCloud)
// load webfonts asynchronously
if (window) {
  fontLoader.load({
    custom: {
      families : ['fiduz']
    }
  })
}


// @ts-ignore
// Ts Ignore needed since VueTour has a different (non exposed part (.util) which breaks the compilation)
// See: https://github.com/getsentry/sentry-javascript/issues/2633
Vue.use(VueTour)

/* tslint:disable */
window.onload = () => {
  new Vue({
    el: '#app',
    render : h => h(App),
    vuetify: new Vuetify(vuetifyOptions),
    router
  }).$mount('#app')
}

