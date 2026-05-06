<template>
  <component
    class="tw-py-4"
    :class="class"
    :is="currentComponent"
    :selected-files="selectedFiles"
    :show-modal="showModal"
    :active-file="activeFile"
    :open-preview="openPreview"
    :on-file-change="onFileChange"
    :remove-file="removeFile"
    :permission-media="permissionMedia"
    :show-component="showComponent"
    @update:show-modal="showModal = $event"
    :label="label"
    :accepted-extensions="acceptedExtensions"
  />
</template>

<script setup>
import { computed } from 'vue';
import { useFileUploadController } from './controller';
import attachField from './components/attachField';
import avatar from './components/avatar';

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  acceptedExtensions: {
    type: String,
    default: '.jpeg,.jpg,.png,.docx,.xlsx,.pdf,.doc,.xls',
  },
  maxFiles: { type: Number, default: 20 },
  zone: { type: String, default: null },
  entityType: { type: String, default: null },
  label: { type: String, default: null },
  type: { type: String, default: null },
  class: { type: String, default: null },
});
const emit = defineEmits(['update:modelValue', 'uploading']);
const {
  selectedFiles,
  showModal,
  activeFile,
  openPreview,
  onFileChange,
  removeFile,
  permissionMedia,
  showComponent,
  label,
} = useFileUploadController(props, emit);

const currentComponent = computed(() => {
  return props.type === 'avatar' ? avatar : attachField;
});
</script>
