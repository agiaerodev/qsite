<template>
  <div id="filterBuilderGenerator" class="tw-min-h-screen tw-bg-slate-50 tw-p-8 tw-font-sans">
    <div class="tw-max-w-7xl tw-mx-auto">
      <FilterHeader />

      <div class="tw-grid tw-grid-cols-1 lg:tw-grid-cols-12 tw-gap-10">
        <div class="lg:tw-col-span-7 tw-space-y-6">
          <FilterForm
            :currentFilter="currentFilter"
            :fieldTypes="fieldTypes"
            :toggles="toggles"
            :newRequestParam="newRequestParam"
            :newOption="newOption"
            :filtersList="filtersList"
            :editingIndex="editingIndex"
            @add-request-param="addRequestParam"
            @add-static-option="addStaticOption"
            @reset-form="resetForm"
            @add-filter="addFilter"
          />

          <FilterList
            v-model:filtersList="filtersList"
            :editFilter="editFilter"
            :getIconForType="getIconForType"
            @delete-filter="handleDeleteFilter"
          />
        </div>

        <JsonPreview
          :generatedJson="generatedJson"
          :handleCopy="handleCopy"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { cloneDeep } from 'lodash';
import useFilterBuilder from './controllers/filterBuilder.js';
import FilterHeader from './components/FilterHeader.vue';
import FilterForm from './components/FilterForm.vue';
import FilterList from './components/FilterList.vue';
import JsonPreview from './components/JsonPreview.vue';

const emit = defineEmits(['update']);

const {
  fieldTypes,
  toggles,
  filtersList,
  newOption,
  newRequestParam,
  editingIndex,
  currentFilter,
  generatedJson,
  addFilter,
  editFilter,
  resetForm,
  addStaticOption,
  addRequestParam,
  handleCopy,
  getIconForType,
} = useFilterBuilder(emit);

const handleDeleteFilter = (index) => {
  filtersList.value.splice(index, 1);
  // El watch de filtersList en el controlador se encargará de emitir automáticamente
};
</script>

<style scoped>
/* EFECTO DE LUGAR VACÍO DONDE QUEDARÁ EL ELEMENTO */
.ghost-card {
  opacity: 0.4;
  background: #eef2ff !important;
  border: 2px dashed #6366f1 !important;
  border-radius: 1.25rem;
}

/* EFECTO DEL ELEMENTO MIENTRAS SE ARRASTRA */
.dragging-card {
  transform: scale(1.02);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1) !important;
}

.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
pre { margin: 0; white-space: pre-wrap; word-wrap: break-word; }
</style>
