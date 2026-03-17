<template>
  <q-card flat class="tw-border tw-border-slate-200 tw-rounded-3xl tw-bg-white tw-shadow-sm tw-overflow-hidden">
    <div class="tw-bg-slate-50/80 tw-px-6 tw-py-4 tw-border-b tw-border-slate-100 tw-flex tw-items-center tw-gap-3">
      <q-icon name="fa-light fa-sliders-up" size="16px" class="tw-text-slate-400" />
      <span class="tw-font-bold tw-text-slate-700 tw-uppercase tw-text-xs tw-tracking-widest">Base Configuration</span>
    </div>

    <q-card-section class="tw-p-6 tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-5">
      <q-input v-model="currentFilter.key" label="Field ID (Key)" stack-label outlined dense color="indigo"
               placeholder="e.g. user_status" />
      <q-select v-model="currentFilter.type" :options="fieldTypes" label="Component Type" stack-label outlined dense
                emit-value map-options color="indigo" />
      <q-input v-model="currentFilter.props.label" label="Display Label" stack-label outlined dense color="indigo"
               placeholder="User Status" />
      <q-input v-model="currentFilter.value" label="Default Value" stack-label outlined dense color="indigo" />
      <q-input v-model="currentFilter.props.hint" label="Hint" stack-label outlined dense color="indigo"
               placeholder="Enter a hint" />
      <q-select
        v-if="currentFilter.type === 'input'"
        v-model="currentFilter.props.type"
        :options="['number', 'textarea']"
        label="Input Type"
        stack-label
        outlined
        dense
        color="indigo"
      />

      <q-input v-model="currentFilter.props.mask" label="Mask" stack-label
               outlined dense color="indigo" placeholder="e.g. ###-##-####" />
      <q-input v-if="currentFilter.type === 'input' && currentFilter.props.type === 'number'"
               v-model.number="currentFilter.props.step" label="Step" type="number" stack-label outlined dense
               color="indigo" />
    </q-card-section>

    <q-card-section class="tw-px-6 tw-pb-8">
      <div
        class="tw-grid tw-grid-cols-2 sm:tw-grid-cols-3 tw-gap-4 tw-p-4 tw-bg-slate-50 tw-rounded-2xl tw-border tw-border-slate-100"
      >
        <div
          v-for="toggle in visibleToggles"
          :key="toggle.model"
          class="tw-flex tw-flex-col tw-items-center"
        >
          <span class="tw-text-[10px] tw-uppercase tw-font-bold tw-text-slate-400 tw-mb-2">
              {{ toggle.label }}
            </span>
          <q-toggle
            v-model="currentFilter.props[toggle.model]"
            color="indigo"
            dense
          />
        </div>
      </div>
    </q-card-section>

    <q-slide-transition>
      <div v-if="currentFilter.type === 'select'" class="tw-border-t tw-border-slate-100">
        <div class="tw-px-6 tw-pt-6">
          <q-tabs v-model="currentFilter.optionsSource" dense class="tw-bg-slate-100 tw-rounded-xl tw-p-1"
                  active-color="indigo" indicator-color="transparent" align="justify" no-caps>
            <q-tab name="api" class="tw-rounded-lg">
              <div class="tw-flex tw-items-center tw-gap-2">
                <q-icon name="fa-light fa-cloud-bolt" size="14px" />
                <span class="tw-font-bold">Remote API</span>
              </div>
            </q-tab>
            <q-tab name="static" class="tw-rounded-lg">
              <div class="tw-flex tw-items-center tw-gap-2">
                <q-icon name="fa-light fa-list-dropdown" size="14px" />
                <span class="tw-font-bold">Static List</span>
              </div>
            </q-tab>
          </q-tabs>
        </div>

        <q-tab-panels v-model="currentFilter.optionsSource" animated class="tw-bg-transparent">
          <q-tab-panel name="api" class="tw-p-6 tw-space-y-4">
            <q-input v-model="currentFilter.loadOptions.apiRoute" label="Endpoint URL" outlined dense
                     placeholder="/api/v1/options" prefix="GET" />
            <div class="tw-grid tw-grid-cols-2 tw-gap-4">
              <q-input v-model="currentFilter.loadOptions.select.label" label="Label Key" outlined dense
                       placeholder="name" />
              <q-input v-model="currentFilter.loadOptions.select.id" label="Value Key (ID)" outlined dense
                       placeholder="uuid" />
            </div>
            <div class="tw-space-y-2">
              <div class="tw-text-xs tw-font-bold tw-text-slate-500">Request Parameters</div>
              <div class="tw-flex tw-gap-2">
                <q-input v-model="newRequestParam.name" label="Key" dense outlined class="tw-grow" />
                <q-select
                  v-model="newRequestParam.type"
                  :options="['string', 'json']"
                  label="Type"
                  dense
                  outlined
                  class="tw-w-32"
                  emit-value
                  map-options
                />
                <JsonEditorVue
                  v-if="newRequestParam.type === 'json'"
                  v-model="newRequestParam.value"
                  class="tw-grow"
                />
                <q-input
                  v-else
                  v-model="newRequestParam.value"
                  label="Value"
                  dense
                  outlined
                  class="tw-grow"
                />
                <q-btn @click="$emit('add-request-param')" icon="fa-light fa-plus" color="indigo-7" unelevated
                       class="tw-rounded-lg" />
              </div>
              <q-list bordered separator v-if="currentFilter.loadOptions.requestParams.length"
                      class="tw-rounded-xl tw-overflow-hidden">
                <q-item v-for="(param, pIdx) in currentFilter.loadOptions.requestParams" :key="pIdx"
                        class="tw-bg-white hover:tw-bg-slate-50">
                  <q-item-section>
                    <div class="tw-flex tw-items-center tw-gap-2">
                      <q-item-label class="tw-font-medium">{{ param.name }}</q-item-label>
                      <q-badge v-if="param.type" :label="param.type" :color="param.type === 'json' ? 'orange' : 'grey'" outline rounded />
                    </div>
                    <q-item-label caption class="tw-font-mono">{{ param.value }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-btn @click="currentFilter.loadOptions.requestParams.splice(pIdx, 1)"
                           icon="fa-light fa-trash-xmark" color="red-4" flat round dense />
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
          </q-tab-panel>

          <q-tab-panel name="static" class="tw-p-6">
            <div class="tw-flex tw-gap-3 tw-mb-4">
              <q-input v-model="newOption.label" label="Option Label" dense outlined class="tw-grow" />
              <q-input v-model="newOption.value" label="Value" dense outlined class="tw-grow" />
              <q-btn @click="$emit('add-static-option')" icon="fa-light fa-plus" color="indigo-7" unelevated
                     class="tw-rounded-lg" />
            </div>
            <q-list bordered separator class="tw-rounded-xl tw-overflow-hidden">
              <q-item v-for="(opt, idx) in currentFilter.staticOptions" :key="idx"
                      class="tw-bg-white hover:tw-bg-slate-50">
                <q-item-section>
                  <q-item-label class="tw-font-medium">{{ opt.label }}</q-item-label>
                  <q-item-label caption class="tw-font-mono">{{ opt.value }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-btn @click="currentFilter.staticOptions.splice(idx, 1)" icon="fa-light fa-trash-xmark"
                         color="red-4" flat round dense />
                </q-item-section>
              </q-item>
            </q-list>
          </q-tab-panel>
        </q-tab-panels>
      </div>
    </q-slide-transition>

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
import { defineProps, defineEmits, computed } from 'vue';
import JsonEditorVue from 'json-editor-vue';

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
const visibleToggles = computed(() => {
  return props.toggles.filter(toggle =>
    !toggle.shouldDisplay || toggle.shouldDisplay(props.currentFilter)
  );
});
</script>
