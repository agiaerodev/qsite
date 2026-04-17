import { ref, computed, onMounted, watch } from 'vue';
import { cloneDeep, isEqual } from 'lodash';
import baseService from 'modules/qcrud/_services/baseService.js';
import store from '../stores';

// ====================
// Reactive State
// ====================
export const crudData = ref(null);
export const localFilters = ref({});

// ====================
// Computed (Store Binding)
// ====================
export const showModal = computed({
  get: () => store.showModal,
  set: (value: boolean) => {
    store.showModal = value;
  },
});

export const titleModal = computed({
  get: () => store.titleModal,
  set: (value: boolean) => {
    store.titleModal = value;
  },
});

export const loading = computed({
  get: () => store.loading,
  set: (value: boolean) => {
    store.loading = value;
  },
});

// ====================
// API Methods
// ====================
export async function getCrud() {
  try {
    const { criteria, fieldKey } = store;
    loading.value = true;

    const params = {
      refresh: true,
      params: {
        filter: { field: fieldKey },
      },
    };

    const response = await baseService.show(
      'apiRoutes.qsite.cruds',
      criteria,
      params
    );
    crudData.value = response.data;
  } catch (error) {
    console.error('Error loading CRUD:', error);
  } finally {
    loading.value = false;
  }
}

// ====================
// Event Handlers
// ====================
export function handleHide() {
  store.reset();
}

export function handleUpdateFilters(data: any) {
  localFilters.value = cloneDeep(data);
  console.log('Filters updated:', data);
}

// ====================
// Init
// ====================
export async function init() {
  await getCrud();
}


