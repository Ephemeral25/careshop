// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from "vue";
import Vuetify from "vuetify";
import "vuetify/dist/vuetify.min.css";
import App from "./App";
import router from "./router/index.js";
import Axios from "axios";
require = "../server.js";

Vue.prototype.$http = Axios;
Vue.use(Vuetify);
Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
  el: "#app",
  router,
  vuetify: new Vuetify(),
  components: { App },
  template: "<App/>"
});
