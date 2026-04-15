<template>
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

  <FilterRules v-model="currentFilter.props.rules" />

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
</template>

<script setup>
import { computed } from 'vue';
import FilterRules from './FilterRules.vue';
const props = defineProps(['currentFilter', 'fieldTypes', 'toggles']);

const visibleToggles = computed(() => {
  return props.toggles.filter(toggle =>
    !toggle.shouldDisplay || toggle.shouldDisplay(props.currentFilter)
  );
});
</script>
