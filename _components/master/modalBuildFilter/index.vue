<template>
  <master-modal
    v-model="showModal"
    :title="titleModal"
    :persistent="true"
    :loading="loading"
    width="90%"
    @hide="handleHide"
  >
    <filterBuilder
      v-if="!loading && crudData"
      column="filters"
      :data="crudData"
      @update="handleUpdateFilters"
    />
    <div v-else class="row q-col-gutter-xl q-pa-md">
      <div class="col-12 col-md-7">
        <div class="row q-col-gutter-y-md">
          <div v-for="n in 6" :key="'input-' + n" class="col-6 q-px-sm">
            <q-skeleton type="text" width="30%" class="q-mb-xs" />
            <q-skeleton type="QInput" />
          </div>

          <div class="col-12 q-mt-lg">
            <q-skeleton type="text" width="100px" class="q-mb-sm" />
            <q-skeleton
              type="rect"
              height="100px"
              class="rounded-borders"
              style="opacity: 0.5"
            />
          </div>

          <div class="col-12 row q-gutter-md q-mt-md">
            <q-skeleton type="QToggle" v-for="t in 2" :key="'t-' + t" />
          </div>
        </div>
      </div>

      <div class="col-12 col-md-5">
        <q-card
          flat
          class="bg-dark q-pa-md"
          style="border-radius: 8px; min-height: 420px"
        >
          <div class="row q-gutter-xs q-mb-md">
            <div
              class="bg-red-5 rounded-borders"
              style="width: 8px; height: 8px"
            ></div>
            <div
              class="bg-amber-5 rounded-borders"
              style="width: 8px; height: 8px"
            ></div>
            <div
              class="bg-green-5 rounded-borders"
              style="width: 8px; height: 8px"
            ></div>
          </div>

          <div v-for="i in 15" :key="'line-' + i" class="q-mb-xs">
            <q-skeleton
              type="text"
              square
              class="bg-grey-9"
              :style="{
                width: Math.random() * 50 + 20 + '%',
                marginLeft: i > 1 && i < 14 ? '20px' : '0px',
              }"
            />
          </div>
        </q-card>
      </div>
    </div>
  </master-modal>
</template>

<script lang="ts" setup>
import { onMounted, watch } from 'vue';
import filterBuilder from 'modules/qsite/_components/master/filterBuilder/index.vue';

import {
  crudData,
  showModal,
  loading,
  handleHide,
  handleUpdateFilters,
  getCrud,
  init,
  titleModal,
} from './controllers/modalBuildFilter';


onMounted(() => {
  init();
});

watch(
  () => showModal.value,
  (newVal) => {
    if (newVal) {
      getCrud();
    }
  },
  { immediate: true }
);
</script>
