import Vue from 'vue';
import Vuex from 'vuex';
import axios from './axios-auth';
import globalAxios from 'axios';
import router from './router';

const API_KEY = 'AIzaSyCamUIX3QYOnOw9DI3c-zLTv9mVPjRq0gI';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    idToken: null,
    userId: null,
    user: null,
  },
  mutations: {
    authUser(state, userData) {
      state.idToken = userData.idToken;
      state.userId = userData.localId;
    },
    storeUser(state, user) {
      state.user = user;
    },
    clearAuthData(state) {
      state.idToken = null;
      state.userId = null;

      localStorage.removeItem('expirationDate');
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
    },
  },
  actions: {
    setLogoutTimer({ commit, dispatch }, expirationTime) {
      setTimeout(() => {
        dispatch('logout');
      }, expirationTime * 1000);
    },
    signup({ commit, dispatch }, authData) {
      axios
        .post(`accounts:signUp?key=${API_KEY}`, {
          email: authData.email,
          password: authData.password,
          returnSecureToken: true,
        })
        .then((res) => {
          console.log(res);
          commit('authUser', res.data);

          const now = new Date();
          const expirationDate = new Date(
            now.getTime() + res.data.expiresIn * 1000
          );
          localStorage.setItem('token', res.data.idToken);
          localStorage.setItem('userId', res.data.localId);
          localStorage.setItem('expirationDate', expirationDate);

          dispatch('storeUser', { ...authData, userId: res.data.localId });
          commit('storeUser', { ...authData, userId: res.data.localId });
          dispatch('setLogoutTimer', res.data.expiresIn);
          router.replace('/dashboard');
        })
        .catch((error) => console.log(error));
    },
    login({ commit, dispatch }, authData) {
      axios
        .post(`accounts:signInWithPassword?key=${API_KEY}`, {
          email: authData.email,
          password: authData.password,
          returnSecureToken: true,
        })
        .then((res) => {
          console.log(res);

          const now = new Date();
          const expirationDate = new Date(
            now.getTime() + res.data.expiresIn * 1000
          );
          localStorage.setItem('token', res.data.idToken);
          localStorage.setItem('userId', res.data.localId);
          localStorage.setItem('expirationDate', expirationDate);

          commit('authUser', res.data);
          dispatch('storeUser', { ...authData, userId: res.data.localId });
          commit('storeUser', { ...authData, userId: res.data.localId });
          dispatch('setLogoutTimer', res.data.expiresIn);
          router.replace('/dashboard');
        })
        .catch((error) => console.log(error));
    },
    autoLogin({ commit }) {
      const token = localStorage.getItem('token');

      if (!token) {
        return;
      }

      const expirationDate = localStorage.getItem('expirationDate');
      const now = new Date();
      if (now >= expirationDate) {
        return;
      }

      const userId = localStorage.getItem('userId');
      console.log(token, userId);
      commit('authUser', {
        idToken: token,
        localId: userId,
      });

      router.replace('/dashboard');
    },
    logout({ commit }) {
      commit('clearAuthData');
      router.replace('/signin');
    },
    storeUser({ commit, state }, userData) {
      if (!state.idToken) {
        return;
      }

      globalAxios
        .post('users.json' + '?auth=' + state.idToken, userData)
        .then((res) => console.log(res));
    },
    fetchUser({ commit, state }) {
      if (!state.idToken) {
        return;
      }

      globalAxios
        .get('users.json' + '?auth=' + state.idToken)
        .then((res) => {
          const data = res.data;
          const users = [];

          for (let key in data) {
            const user = data[key];
            users.push(user);
          }

          console.log(users);
          console.log(state);

          commit('storeUser', state.user);
        })
        .catch((error) => console.log(error));
    },
  },
  getters: {
    user(state) {
      return state.user;
    },
    isAuthenticated(state) {
      return state.idToken !== null;
    },
  },
});
