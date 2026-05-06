<template>
  <div
    class="tw-flex tw-flex-wrap tw-items-start tw-gap-2"
    v-if="permissionMedia.index && showComponent"
  >
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
          <div
            v-if="file.uploading"
            class="tw-w-full tw-h-full tw-rounded-full tw-flex tw-items-center tw-justify-center"
          >
            <q-skeleton type="QAvatar" size="40px" animation="pulse" />
          </div>

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
              alt="file preview"
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

        <button
          v-if="!file.uploading && permissionMedia.destroy"
          @click.stop="removeFile(index)"
          class="tw-absolute -tw-top-0.5 -tw-right-0.5 tw-w-4 tw-h-4 tw-bg-white tw-rounded-full tw-shadow-sm tw-flex tw-items-center tw-justify-center tw-border tw-border-gray-100 hover:tw-bg-red-50"
        >
          <i class="fa-solid fa-xmark tw-text-[#5c6bc0] tw-text-[8px]" />
        </button>
      </div>
    </div>

    <filePreviewModal :model-value="showModal" @update:model-value="$emit('update:showModal', $event)" :file="activeFile" />
  </div>
  <div class="tw-bg-yellow-300 tw-text-black tw-p-2 tw-rounded" v-else>
    The field cannot be displayed: zone or entity type missing from
    configuration.
  </div>
</template>

<script setup>
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

defineEmits(['update:showModal']);
</script>

