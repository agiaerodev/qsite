<template>
  <div v-if="filtersList.length > 0" class="tw-space-y-3">
    <h3
      class="tw-text-xs tw-font-bold tw-text-slate-400 tw-uppercase tw-tracking-widest tw-flex tw-items-center tw-gap-2">
      <q-icon name="fa-light fa-layer-group" />
      Current Stack
    </h3>

    <draggable
      :model-value="filtersList"
      @update:model-value="handleReorder"
      item-key="key"
      :animation="300"
      ghost-class="ghost-card"
      drag-class="dragging-card"
      handle=".drag-handle"
      class="tw-space-y-3"
    >
      <template #item="{ element, index }">
        <div
          class="tw-group tw-flex tw-items-center tw-justify-between tw-bg-white tw-p-4 tw-rounded-2xl tw-border tw-border-slate-200 tw-shadow-sm hover:tw-border-indigo-200 tw-transition-all">
          <div class="tw-flex tw-items-center tw-gap-4">
            <div class="drag-handle tw-cursor-grab active:tw-cursor-grabbing tw-p-1">
              <q-icon name="fa-solid fa-grip-dots-vertical" class="tw-text-slate-300 group-hover:tw-text-indigo-400"
                      size="16px" />
            </div>
            <div
              class="tw-w-10 tw-h-10 tw-bg-indigo-50 tw-text-indigo-600 tw-rounded-xl tw-flex tw-items-center tw-justify-center">
              <q-icon :name="getIconForType(element.type)" size="18px" />
            </div>
            <div>
              <div class="tw-font-bold tw-text-slate-800">{{ element.key }}</div>
              <div class="tw-text-xs tw-text-slate-400 tw-font-mono">{{ element.type.toUpperCase() }} • {{ element.label
                }}
              </div>
            </div>
          </div>
          <div class="tw-flex tw-gap-2">
            <q-btn @click.stop="editFilter(index)" icon="fa-light fa-pen" color="indigo-4" flat round dense
                   class="tw-opacity-0 group-hover:tw-opacity-100 tw-transition-opacity" />
            <q-btn @click.stop="$emit('delete-filter', index)" icon="fa-light fa-trash-can" color="red-4" flat round
                   dense class="tw-opacity-0 group-hover:tw-opacity-100 tw-transition-opacity" />
          </div>
        </div>
      </template>
    </draggable>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';
import draggable from 'vuedraggable';

const props = defineProps({
  filtersList: {
    type: Array,
    required: true
  },
  editFilter: {
    type: Function,
    required: true
  },
  getIconForType: {
    type: Function,
    required: true
  }
});

const emit = defineEmits(['update:filtersList', 'delete-filter', 'filters-reordered']);


const handleReorder = (newList) => {
  emit('update:filtersList', newList);
  emit('filters-reordered', newList);
};
</script>

<style scoped>
.ghost-card {
  opacity: 0.4;
  background: #eef2ff !important;
  border: 2px dashed #6366f1 !important;
  border-radius: 1.25rem;
}

.dragging-card {
  transform: scale(1.02);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1) !important;
}
</style>
