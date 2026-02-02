<template>
  <div class="dashboard">
    <template v-for="quickCard in views">
      <component :is="quickCard.component" v-bind="quickCard" />
    </template>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import controller from './controller';

export default defineComponent({
  props: {
    configName: {
      type: String,
      default: null,
    },
    dynamicFilterValues: {
      required: false,
      type: Object,
      default: () => ({}),
    },
    quickCards: {
      required: false,
      type: Object,
      default: () => ({}),
    },
    baseFilters: {
      required: false,
      type: Object,
      default: () => ({}),
    },
  },
  setup(props, { emit }) {
    return controller(props, emit);
  },
});
</script>
<style lang="scss">
.dashboard {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 20px;
}
</style>
