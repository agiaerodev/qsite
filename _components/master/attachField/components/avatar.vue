<template>
  <div
    class="tw-flex tw-items-center"
    v-if="permissionMedia.index && showComponent"
  >
    <div class="tw-relative tw-w-24 tw-h-24">
      <div
        class="tw-w-full tw-h-full tw-rounded-full tw-overflow-hidden tw-border-2 tw-border-gray-100 tw-shadow-sm tw-bg-gray-50 tw-flex tw-items-center tw-justify-center tw-cursor-pointer transition-all hover:tw-opacity-95"
        @click="selectedFiles[0] && !selectedFiles[0].uploading && openPreview(selectedFiles[0])"
      >
        <div
          v-if="selectedFiles[0]?.uploading"
          class="tw-w-full tw-h-full tw-flex tw-items-center tw-justify-center"
        >
          <q-skeleton type="QAvatar" size="100%" animation="pulse" />
        </div>

        <img
          v-else-if="selectedFiles[0]?.isImage"
          :src="selectedFiles[0].previewUrl"
          :alt="selectedFiles[0].name || 'Avatar'"
          class="tw-w-full tw-h-full tw-object-cover"
        />

        <img
          v-else
          src="https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/svg/1f464.svg"
          alt="Default Avatar"
          class="tw-w-1/2 tw-h-1/2 tw-opacity-40 tw-object-contain"
        />
      </div>

      <button
        v-if="permissionMedia.create && (!selectedFiles[0] || !selectedFiles[0].uploading)"
        type="button"
        @click="fileInputRef.click()"
        class="tw-absolute tw-bottom-0 tw-right-0 tw-w-8 tw-h-8 tw-bg-white tw-border tw-border-gray-200 tw-rounded-xl tw-shadow-md tw-flex tw-items-center tw-justify-center tw-cursor-pointer hover:tw-bg-gray-50 tw-transition-all"
        title="Cambiar imagen"
      >
        <i class="fa-solid fa-pen tw-text-gray-600 tw-text-xs"></i>
      </button>

      <input
        ref="fileInputRef"
        type="file"
        class="tw-hidden"
        :accept="acceptedExtensions"
        @change="handleFileSelection"
      />
    </div>

    <filePreviewModal
      :model-value="showModal"
      @update:model-value="$emit('update:showModal', $event)"
      :file="activeFile"
    />
  </div>

  <div
    class="tw-bg-red-50 tw-text-red-700 tw-p-3 tw-rounded-xl tw-border tw-border-red-100 tw-text-sm"
    v-else
  >
    The field cannot be displayed: zone or entity type missing from configuration.
  </div>
</template>

<script setup>
import { ref } from 'vue';
import filePreviewModal from '../../filePreviewModal';

const props = defineProps({
  selectedFiles: { type: Array, default: () => [] },
  showModal: { type: Boolean, default: false },
  activeFile: { type: Object, default: null },
  openPreview: { type: Function, required: true },
  onFileChange: { type: Function, required: true },
  removeFile: { type: Function, required: true },
  permissionMedia: { type: Object, required: true },
  showComponent: { type: Boolean, default: true },
  label: { type: String, default: null },
  acceptedExtensions: { type: String, default: '' },
});

const emit = defineEmits(['update:showModal']);

const fileInputRef = ref(null);

const handleFileSelection = (event) => {
  const newFile = event.target.files?.[0];
  if (!newFile) return;
  if (props.selectedFiles[0]) {
    props.removeFile(0);
  }
  props.onFileChange(event);
  event.target.value = '';
};
</script>
