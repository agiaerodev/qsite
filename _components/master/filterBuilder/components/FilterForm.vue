<template>
  <q-card flat class="tw-border tw-border-slate-200 tw-rounded-3xl tw-bg-white tw-shadow-sm tw-overflow-hidden">
    <div class="tw-bg-slate-50/80 tw-px-6 tw-py-4 tw-border-b tw-border-slate-100 tw-flex tw-items-center tw-gap-3">
      <q-icon name="fa-light fa-sliders-up" size="16px" class="tw-text-slate-400" />
      <span class="tw-font-bold tw-text-slate-700 tw-uppercase tw-text-xs tw-tracking-widest">Base Configuration</span>
    </div>

    <FilterBaseConfig
      :currentFilter="currentFilter"
      :field-types="fieldTypes"
      :toggles="toggles"
    />

    <FilterDataSource
      :currentFilter="currentFilter"
      :new-request-param="newRequestParam"
      :new-option="newOption"
      @add-request-param="$emit('add-request-param')"
      @add-static-option="$emit('add-static-option')"
    />

    <q-card-actions align="between" class="tw-bg-slate-50/50 tw-p-6">
      <q-btn @click="$emit('reset-form')" label="Discard Draft" flat color="slate-400" no-caps
             icon="fa-light fa-trash-undo" />
      <q-btn @click="$emit('add-filter')" unelevated color="indigo-7"
             class="tw-rounded-xl tw-px-6 tw-py-3 shadow-indigo" no-caps>
        <div class="tw-space-x-1">
          <q-icon :name="editingIndex >= 0 ? 'fa-light fa-pen-to-square' : 'fa-light fa-plus-circle'" start
                  size="18px" />
          <span class="tw-font-bold">{{ editingIndex >= 0 ? 'Update' : 'Save' }}</span>
        </div>
      </q-btn>
      <div class="tw-text-xs tw-font-bold tw-text-slate-400 tw-uppercase tw-tracking-widest">
        <q-icon name="fa-light fa-database" class="tw-mr-1" />
        Items: {{ filtersList.length }}
      </div>
    </q-card-actions>
  </q-card>
</template>

<script setup>
import FilterBaseConfig from './FilterBaseConfig.vue';
import FilterDataSource from './FilterDataSource.vue';
import { useFilterFormController } from '../controllers/filterForm.js';

// ...existing code...
const props = defineProps({
  currentFilter: {
    type: Object,
    required: true
  },
  fieldTypes: {
    type: Array,
    required: true
  },
  toggles: {
    type: Array,
    required: true
  },
  newRequestParam: {
    type: Object,
    required: true
  },
  newOption: {
    type: Object,
    required: true
  },
  filtersList: {
    type: Array,
    required: true
  },
  editingIndex: {
    type: Number,
    required: true
  }
});

defineEmits(['add-request-param', 'add-static-option', 'reset-form', 'add-filter']);

useFilterFormController(props);
</script>
