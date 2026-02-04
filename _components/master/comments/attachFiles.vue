<template>
  <div class="tw-flex tw-flex-wrap tw-items-start tw-gap-2">
    <label class="tw-flex tw-items-center tw-gap-2 tw-px-4 tw-h-10 tw-bg-[#f0f4ff] tw-border tw-border-[#e0e7ff] tw-rounded-full tw-cursor-pointer hover:tw-bg-white tw-transition-all tw-group shadow-sm">
      <i class="fa-solid fa-paperclip tw-text-[#5c6bc0] tw-text-sm tw-ml-2"></i>
      <span class="tw-text-sm tw-font-semibold tw-text-[#5c6bc0]">Attach Files</span>
      <input type="file" class="tw-hidden" :multiple="maxFiles > 1" :accept="acceptedExtensions" @change="onFileChange" />
    </label>

    <div class="tw-flex tw-flex-wrap tw-items-center tw-gap-2">
      <div v-for="(file, index) in selectedFiles" :key="index" class="tw-relative tw-w-10 tw-h-10 tw-group tw-cursor-pointer" @click="openPreview(file)">
        <div class="tw-w-full tw-h-full tw-rounded-full tw-bg-white tw-p-0.5 tw-shadow-sm tw-border tw-border-gray-100 tw-overflow-hidden">
          <div class="tw-w-full tw-h-full tw-rounded-full tw-flex tw-items-center tw-justify-center" :style="{ backgroundColor: file.isImage ? 'transparent' : file.color + '15' }">
            <img v-if="file.isImage" :src="file.previewUrl" class="tw-w-full tw-h-full tw-object-cover" />
            <i v-else :class="file.icon" :style="{ color: file.color }" class="tw-text-sm" />
          </div>
        </div>
        <button @click.stop="removeFile(index)" class="tw-absolute -tw-top-0.5 -tw-right-0.5 tw-w-4 tw-h-4 tw-bg-white tw-rounded-full tw-shadow-sm tw-flex tw-items-center tw-justify-center tw-border tw-border-gray-100 hover:tw-bg-red-50">
          <i class="fa-solid fa-xmark tw-text-[#5c6bc0] tw-text-[8px]" />
        </button>
      </div>
    </div>

    <div v-if="showModal" class="tw-fixed tw-inset-0 tw-z-[999] tw-flex tw-items-center tw-justify-center tw-bg-black/70 tw-p-4" @click.self="closePreview">
      <div class="tw-bg-white tw-rounded-xl tw-w-full tw-max-w-5xl tw-h-[90vh] tw-flex tw-flex-col tw-overflow-hidden shadow-2xl">
        <div class="tw-flex tw-justify-between tw-items-center tw-p-4 tw-border-b">
          <span class="tw-font-bold tw-text-gray-700">{{ activeFile?.name }}</span>
          <button @click="closePreview"><i class="fa-solid fa-circle-xmark tw-text-xl tw-text-gray-400"></i></button>
        </div>

        <div class="tw-flex-1 tw-overflow-auto tw-bg-gray-50 tw-p-4">
          <div v-if="activeFile?.isImage" class="tw-h-full tw-flex tw-items-center tw-justify-center">
            <img :src="activeFile.previewUrl" class="tw-max-w-full tw-max-h-full tw-object-contain shadow-md" />
          </div>

          <iframe v-else-if="isPdf" :src="activeFile.previewUrl" class="tw-w-full tw-h-full tw-border-none"></iframe>

          <div v-else-if="isWord" ref="wordPreviewContainer" class="tw-bg-white tw-shadow-sm tw-mx-auto tw-p-2 tw-min-h-full"></div>

          <div v-else-if="isExcel" class="tw-bg-white tw-overflow-auto tw-max-w-full">
            <table v-html="excelHtml" class="excel-table tw-w-full tw-text-xs"></table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from "vue";
import { renderAsync } from "docx-preview";
import * as XLSX from "xlsx";

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  acceptedExtensions: { type: String, default: ".jpeg,.jpg,.png,.docx,.xlsx,.pdf,.doc,.xls" },
  maxFiles: { type: Number, default: 20 },
});

const emit = defineEmits(["update:modelValue"]);
const showModal = ref(false);
const activeFile = ref(null);
const wordPreviewContainer = ref(null);
const excelHtml = ref("");

const isPdf = computed(() => activeFile.value?.name.toLowerCase().endsWith('.pdf'));
const isWord = computed(() => activeFile.value?.name.toLowerCase().endsWith('.docx'));
const isExcel = computed(() => activeFile.value?.name.toLowerCase().endsWith('.xlsx'));

const selectedFiles = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

async function openPreview(file) {
  activeFile.value = file;
  showModal.value = true;
  excelHtml.value = "";

  await nextTick();

  if (isWord.value) {
    // Local DOCX rendering
    renderAsync(file.rawFile, wordPreviewContainer.value);
  } else if (isExcel.value) {
    // Local XLSX rendering
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      excelHtml.value = XLSX.utils.sheet_to_html(worksheet);
    };
    reader.readAsArrayBuffer(file.rawFile);
  }
}

function closePreview() {
  showModal.value = false;
  activeFile.value = null;
}

/* Logic for building previews unchanged but ensured rawFile is stored */
function onFileChange(event) {
  const uploadedFiles = Array.from(event.target.files);
  uploadedFiles.forEach((file) => {
    const metadata = resolveFileMetadata(file);
    selectedFiles.value.push({
      name: file.name,
      isImage: metadata.isImage,
      previewUrl: (metadata.isImage || file.name.toLowerCase().endsWith('.pdf')) ? URL.createObjectURL(file) : null,
      icon: metadata.icon,
      color: metadata.color,
      rawFile: file,
    });
  });
  event.target.value = "";
}

function resolveFileMetadata(file) {
  if (file.type.startsWith("image/")) return { isImage: true, icon: "", color: "" };
  const n = file.name.toLowerCase();
  if (n.endsWith(".pdf")) return { isImage: false, icon: "fa-solid fa-file-pdf", color: "#ff5252" };
  if (n.endsWith(".xls") || n.endsWith(".xlsx")) return { isImage: false, icon: "fa-solid fa-file-excel", color: "#2ecc71" };
  if (n.endsWith(".doc") || n.endsWith(".docx")) return { isImage: false, icon: "fa-solid fa-file-word", color: "#3498db" };
  return { isImage: false, icon: "fa-solid fa-file", color: "#5c6bc0" };
}

function removeFile(index) {
  selectedFiles.value = selectedFiles.value.filter((_, i) => i !== index);
}
</script>

<style>
/* Styling for the Excel table render */
.excel-table { border-collapse: collapse; }
.excel-table td { border: 1px solid #ddd; padding: 4px 8px; }
</style>
