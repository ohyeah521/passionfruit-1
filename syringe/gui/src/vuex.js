import Vuex from 'vuex'
import Vue from 'vue'
import axios from 'axios'


Vue.use(Vuex)

function directSetter(...keys) {
  const result = {}
  keys.forEach(key => {
    result[key] = (state, val) => {
      state[key] = val
    }
  })
  return result
}

function directGetter(...keys) {
  const result = {}
  keys.forEach(key => {
    result[key] = state => state[key]
  })
  return result
}

const store = new Vuex.Store({
  state: {
    devices: [],
    device: {},
    loadingDevices: false,
    apps: [],
    app: {},
    loadingApps: false,
    appsLoadErr: ''
  },
  getters: {
    device(state) { return state.devices.length ? state.device : {} },
    app(state) { return state.apps.length ? state.app : {} },
    ...directGetter('apps', 'devices', 'appsLoadErr', 'loadingApps')
  },
  mutations: {
    removeDevice(state, device) {
      if (device.id == state.device.id) {
        state.app = []
        device = {}
      }
      // remove
      state.devices = state.devices.filter(dev => dev.id !== device.id)
    },
    setDevice(state, id) {
      let dev = state.devices.find(dev => dev.id == id)
      if (!dev)
        state.appsLoadErr = 'device not found'
      else
        state.device = dev
    },
    app(state, bundle) { state.app = state.apps.find(app => app.identifier == bundle) },
    addDevice(state, device) { state.devices.push(device) },
    ...directSetter('devices', 'apps', 'loadingApps', 'loadingDevices', 'appsLoadErr'),
  },
  actions: {
    refreshDevices({ commit }) {
      commit('loadingDevices', true)
      axios.get('/api/devices')
        .then(({ data }) => {
          commit('loadingDevices', false)
          commit('devices', data)
        })
        .catch(err => {
          commit('loadingDevices', false)
          commit('devices', [])
          commit('device', {})
          // todo: handle error
        })
    },
    refreshApps({ commit, state }) {
      if (state.loadingDevices || !state.device || !state.device.id)
        return

      commit('loadingApps', true)
      commit('appsLoadErr', '')
      axios.get('/api/apps/' + state.device.id)
        .then(({ data }) => {
          commit('loadingApps', false)
          commit('apps', data)
        })
        .catch(err => {
          commit('loadingApps', false)
          commit('apps', [])
          commit('appsLoadErr', err.response.data)
        })
    }
  }
})

export default store