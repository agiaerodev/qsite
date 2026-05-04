<template>
  <div
    class="tw-flex tw-flex-wrap tw-items-start tw-gap-2"
    v-if="permissionMedia.index && showComponent"
  >
    <!-- Upload Button -->
    <label
      class="tw-flex tw-items-center tw-gap-2 tw-px-4 tw-h-10 tw-bg-[#f0f4ff] tw-border tw-border-[#e0e7ff] tw-rounded-full tw-cursor-pointer hover:tw-bg-white tw-transition-all tw-group shadow-sm"
      v-if="permissionMedia.create"
    >
      <i class="fa-solid fa-paperclip tw-text-[#5c6bc0] tw-text-sm tw-ml-2"></i>
      <span class="tw-text-sm tw-font-semibold tw-text-[#5c6bc0]">
        {{ label }}
      </span>

      <input
        type="file"
        class="tw-hidden"
        :accept="acceptedExtensions"
        @change="onFileChange"
      />
    </label>

    <!-- Preview Thumbnails -->
    <div
      class="tw-flex tw-flex-wrap tw-items-center tw-gap-2"
      v-if="permissionMedia.index"
    >
      <div
        v-for="(file, index) in selectedFiles"
        :key="index"
        class="tw-relative tw-w-10 tw-h-10 tw-group tw-cursor-pointer"
        @click="!file.uploading && openPreview(file)"
      >
        <div
          class="tw-w-full tw-h-full tw-rounded-full tw-bg-white tw-p-0.5 tw-shadow-sm tw-border tw-border-gray-100 tw-overflow-hidden"
        >
          <!-- ✅ QUASAR Skeleton Loader -->
          <div
            v-if="file.uploading"
            class="tw-w-full tw-h-full tw-rounded-full tw-flex tw-items-center tw-justify-center"
          >
            <q-skeleton type="QAvatar" size="40px" animation="pulse" />
          </div>

          <!-- ✅ Real Preview -->
          <div
            v-else
            class="tw-w-full tw-h-full tw-rounded-full tw-flex tw-items-center tw-justify-center"
            :style="{
              backgroundColor: file.isImage ? 'transparent' : file.color + '15',
            }"
          >
            <img
              v-if="file.isImage"
              :src="file.previewUrl"
              class="tw-w-full tw-h-full tw-object-cover"
            />

            <i
              v-else
              :class="file.icon"
              :style="{ color: file.color }"
              class="tw-text-sm"
            />
          </div>
        </div>

        <!-- ❌ Remove disabled while uploading -->
        <button
          v-if="!file.uploading && permissionMedia.destroy"
          @click.stop="removeFile(index)"
          class="tw-absolute -tw-top-0.5 -tw-right-0.5 tw-w-4 tw-h-4 tw-bg-white tw-rounded-full tw-shadow-sm tw-flex tw-items-center tw-justify-center tw-border tw-border-gray-100 hover:tw-bg-red-50"
        >
          <i class="fa-solid fa-xmark tw-text-[#5c6bc0] tw-text-[8px]" />
        </button>
      </div>
    </div>

    <!-- Modal Preview -->
    <filePreviewModal v-model="showModal" :file="activeFile" />
  </div>
  <div class="tw-bg-yellow-300 tw-text-black tw-p-2 tw-rounded" v-else>
    The field cannot be displayed: zone or entity type missing from
    configuration.
  </div>
</template>

<script setup>
import { useFileUploadController } from './controller';
import filePreviewModal from '../filePreviewModal';
/*
  ---------------------------------------------
  * Props & Emits
  ---------------------------------------------
*/
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
</script>

<style>
.excel-table {
  border-collapse: collapse;
}

.excel-table td {
  border: 1px solid #ddd;
  padding: 4px 8px;
}
</style>
