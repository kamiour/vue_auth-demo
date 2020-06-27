import Vue from 'vue';
import App from './App.vue';

import router from './router';
import store from './store';
import axios from 'axios';
import Vuelidate from 'vuelidate';

Vue.use(Vuelidate);

axios.defaults.baseURL = 'https://vuejs-auth-fae33.firebaseio.com/';
// axios.defaults.headers.common['Authorization'] = 'value';
// axios.defaults.headers.get['Accepts'] = 'acceptsValue';

const requestInterceptor = axios.interceptors.request.use((config) => {
  console.log(config);
  return config;
});

const responseInterceptor = axios.interceptors.response.use((response) => {
  console.log(response);
  return response;
});

axios.interceptors.request.eject(requestInterceptor);
axios.interceptors.response.eject(responseInterceptor);

new Vue({
  el: '#app',
  router,
  store,
  render: (h) => h(App),
});
