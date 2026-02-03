<template>
  <div class="tw-flex tw-flex-wrap tw-items-start tw-gap-2">

    <!-- Upload Button -->
    <label
      class="tw-flex tw-items-center tw-gap-2 tw-px-4 tw-h-10 tw-bg-[#f0f4ff]
             tw-border tw-border-[#e0e7ff] tw-rounded-full tw-cursor-pointer
             hover:tw-bg-white tw-transition-all tw-group shadow-sm"
    >
      <i class="fa-solid fa-paperclip tw-text-[#5c6bc0] tw-text-sm tw-ml-2"></i>
      <span class="tw-text-sm tw-font-semibold tw-text-[#5c6bc0]">
        Attach Files
      </span>

      <input
        type="file"
        class="tw-hidden"
        :multiple="maxFiles > 1"
        :accept="acceptedExtensions"
        @change="onFileChange"
      />
    </label>

    <!-- Preview Files -->
    <div class="tw-flex tw-flex-wrap tw-items-center tw-gap-2">

      <div
        v-for="(file, index) in selectedFiles"
        :key="index"
        class="tw-relative tw-w-10 tw-h-10 tw-group"
      >
        <!-- Tooltip -->
        <div
          class="tw-absolute -tw-top-8 tw-left-1/2 -tw-translate-x-1/2
                 tw-bg-gray-800 tw-text-white tw-text-[9px]
                 tw-px-2 tw-py-0.5 tw-rounded tw-opacity-0
                 group-hover:tw-opacity-100 tw-transition-opacity
                 tw-pointer-events-none tw-whitespace-nowrap tw-z-20"
        >
          {{ file.name }}

          <div
            class="tw-absolute tw-top-full tw-left-1/2 -tw-translate-x-1/2
                   tw-border-4 tw-border-transparent tw-border-t-gray-800"
          />
        </div>

        <!-- File Icon -->
        <div
          class="tw-w-full tw-h-full tw-rounded-full tw-bg-white
                 tw-p-0.5 tw-shadow-sm tw-border tw-border-gray-100
                 tw-overflow-hidden"
        >
          <div
            class="tw-w-full tw-h-full tw-rounded-full tw-flex
                   tw-items-center tw-justify-center tw-overflow-hidden"
            :style="{
              backgroundColor: file.isImage
                ? 'transparent'
                : file.color + '15'
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

        <!-- Remove Button -->
        <button
          @click.stop="removeFile(index)"
          class="tw-absolute -tw-top-0.5 -tw-right-0.5 tw-w-4 tw-h-4
                 tw-bg-white tw-rounded-full tw-shadow-sm tw-flex
                 tw-items-center tw-justify-center tw-border
                 tw-border-gray-100 tw-z-10 hover:tw-bg-red-50"
        >
          <i class="fa-solid fa-xmark tw-text-[#5c6bc0] tw-text-[8px]" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { alert } from "../../../../../plugins/utils";

/* ---------------------------------------------
 * Props
 --------------------------------------------- */
const props = defineProps({
  acceptedExtensions: {
    type: String,
    default: ".jpeg,.jpg,.png,.docx,.xlsx,.pdf",
  },
  maxFiles: {
    type: Number,
    default: 20,
  },
});

/* ---------------------------------------------
 * State
 --------------------------------------------- */
const selectedFiles = ref([]);

/* ---------------------------------------------
 * Event Handlers
 --------------------------------------------- */
function onFileChange(event) {
  const uploadedFiles = Array.from(event.target.files);

  if (!validateMaxFiles(uploadedFiles)) return;

  uploadedFiles.forEach((file) => {
    if (!validateExtension(file)) return;

    selectedFiles.value.push(buildFilePreview(file));
  });

  // Reset input
  event.target.value = "";
}

/* ---------------------------------------------
 * Validations
 --------------------------------------------- */
function validateMaxFiles(newFiles) {
  const totalFiles = selectedFiles.value.length + newFiles.length;

  if (totalFiles > props.maxFiles) {
    alert.warning(`You can only upload a maximum of ${props.maxFiles} files.`);
    return false;
  }

  return true;
}

function validateExtension(file) {
  const extension = "." + file.name.split(".").pop().toLowerCase();

  if (!props.acceptedExtensions.includes(extension)) {
    alert.warning(`File not allowed: ${file.name}`);
    return false;
  }

  return true;
}

/* ---------------------------------------------
 * File Helpers
 --------------------------------------------- */
function buildFilePreview(file) {
  const metadata = resolveFileMetadata(file);

  return {
    name: file.name,
    isImage: metadata.isImage,
    previewUrl: metadata.isImage ? URL.createObjectURL(file) : null,
    icon: metadata.icon,
    color: metadata.color,
  };
}

function resolveFileMetadata(file) {
  if (file.type.startsWith("image/")) {
    return { isImage: true, icon: "", color: "" };
  }

  const name = file.name.toLowerCase();

  if (name.endsWith(".pdf"))
    return { isImage: false, icon: "fa-solid fa-file-pdf", color: "#ff5252" };

  if (name.endsWith(".xls") || name.endsWith(".xlsx"))
    return { isImage: false, icon: "fa-solid fa-file-excel", color: "#2ecc71" };

  if (name.endsWith(".doc") || name.endsWith(".docx"))
    return { isImage: false, icon: "fa-solid fa-file-word", color: "#3498db" };

  return { isImage: false, icon: "fa-solid fa-file", color: "#5c6bc0" };
}

/* ---------------------------------------------
 * Actions
 --------------------------------------------- */
function removeFile(index) {
  selectedFiles.value.splice(index, 1);
}
</script>
