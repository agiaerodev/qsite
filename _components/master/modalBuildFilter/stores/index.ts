import { reactive, computed, ref } from 'vue';

const state = reactive({
  loading: false,
  showModal: false,
  titleModal: 'Field Builder',
});

const store = computed(() => {
  const proxy: any = {};

  Object.keys(state).forEach((key) => {
    Object.defineProperty(proxy, key, {
      get: () => state[key],
      set: (value) => (state[key] = value),
    });
  });

  proxy.reset = () => {
    state.loading = false;
    state.showModal = false;
  };

  return proxy;
}).value;



export default store;
