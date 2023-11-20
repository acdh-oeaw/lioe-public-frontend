import "@mdi/font/css/materialdesignicons.min.css";
import "vuetify/dist/vuetify.min.css";
import "@/styles/fonts.css";
import "@/styles/global.css";
import "vue-tour/dist/vue-tour.css";

import Vue from "vue";
import Vuetify from "vuetify";
import VueWordCloud from "vuewordcloud";
import Vuex from "vuex";
import VueLazyload from "vue-lazyload";
import VueMatomo from "vue-matomo";
import VueRouter from "vue-router";
import VueTour from "vue-tour";

import App from "@/components/App.vue";
import router from "@/router";

export const $bus = new Vue();

Vue.prototype.$bus = $bus;

Vue.config.devtools = true;
Vue.config.productionTip = true;

Vue.use(Vuex);
Vue.use(VueRouter);

Vue.use(Vuetify);
const vuetify = new Vuetify({
  icons: {
    iconfont: "mdi",
  },
  theme: {
    themes: {
      light: {
        ci: "#3b89a0",
        primary: "#3b89a0",
        secondary: "#2c6374",
        accent: "#88dbdf",
      },
    },
    options: {
      customProperties: true,
    },
  },
});

Vue.use(VueLazyload, { lazyComponent: true });
Vue.component(VueWordCloud.name, VueWordCloud);
Vue.use(VueMatomo, {
  host: "https://matomo.acdh.oeaw.ac.at",
  siteId: "217",
  router: router,
  requireConsent: true,
  enableHeartBeatTimer: true,
  debug: import.meta.env.DEV,
  preInitActions: [
    ["setSecureCookie", window.location.protocol === "https:"],
    ["setCookieSameSite", "Strict"],
  ],
});
Vue.use(VueTour);

new Vue({
  router,
  vuetify,
  render(h) {
    return h(App);
  },
}).$mount("#app");
