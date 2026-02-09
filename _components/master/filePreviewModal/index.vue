<template>
  <div
    v-if="modelValue"
    class="tw-fixed tw-inset-0 tw-z-[999] tw-flex tw-items-center tw-justify-center tw-bg-black/70 tw-p-4"
    @click.self="close"
  >
    <div
      class="tw-relative tw-bg-white tw-rounded-xl tw-shadow-2xl tw-w-full tw-max-w-6xl tw-h-[90vh] tw-flex tw-flex-col tw-overflow-hidden"
    >
      <!-- Header -->
      <div class="tw-flex tw-items-center tw-justify-between tw-px-4 tw-py-3 tw-border-b">
        <div class="tw-truncate tw-font-semibold tw-text-gray-700">
          {{ file?.name }}
        </div>
        <button
          class="tw-text-gray-400 hover:tw-text-red-500 tw-text-xl"
          @click="close"
        >
          ✕
        </button>
      </div>

      <!-- Body -->
      <div class="tw-relative tw-flex-1 tw-overflow-auto tw-bg-gray-50">

        <!-- Loader -->
        <div
          v-if="loading"
          class="tw-absolute tw-inset-0 tw-flex tw-items-center tw-justify-center tw-bg-white/80 tw-z-10"
        >
          <div
            class="tw-animate-spin tw-rounded-full tw-h-12 tw-w-12 tw-border-4 tw-border-primary tw-border-t-transparent"></div>
        </div>

        <!-- IMAGE -->
        <img
          v-if="isImage"
          :src="previewUrl"
          class="tw-max-w-full tw-max-h-full tw-mx-auto tw-my-4 tw-rounded"
        />

        <!-- PDF -->
        <iframe
          v-else-if="isPdf"
          :src="previewUrl"
          class="tw-w-full tw-h-full"
        />

        <!-- WORD -->
        <div
          v-else-if="isWord"
          ref="wordPreviewContainer"
          class="tw-p-6 tw-bg-white"
        />

        <!-- EXCEL -->
        <div
          v-else-if="isExcel"
          v-html="excelHtml"
          class="tw-p-4 tw-bg-white"
        />

        <!-- UNSUPPORTED -->
        <div
          v-else
          class="tw-flex tw-flex-col tw-items-center tw-justify-center tw-h-full tw-text-gray-400"
        >
          <i class="fa-regular fa-file tw-text-6xl tw-mb-4"></i>
          <p>This file cannot be previewed</p>
        </div>

      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import { renderAsync } from 'docx-preview';
import * as XLSX from 'xlsx';

const modelValue = defineModel({ type: Boolean });

const props = defineProps({
  file: { type: Object, default: null }
});

const wordPreviewContainer = ref(null);
const excelHtml = ref('');
const loading = ref(true);
const previewUrl = ref(null);

/* ---------------------------------------------
 * File detection
 --------------------------------------------- */
const filename = computed(() =>
  props.file?.name?.toLowerCase() || ''
);

const isImage = computed(() =>
  ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.svg'].some(ext =>
    filename.value.endsWith(ext)
  )
);

const isPdf = computed(() => filename.value.endsWith('.pdf'));
const isWord = computed(() => filename.value.endsWith('.docx'));
const isExcel = computed(() => filename.value.endsWith('.xlsx'));

/* ---------------------------------------------
 * Watch preview
 --------------------------------------------- */
watch(() => props.file, async (file) => {
  if (!file) return;

  loading.value = true;
  excelHtml.value = '';
  previewUrl.value && URL.revokeObjectURL(previewUrl.value);
  previewUrl.value = null;

  await nextTick();

  try {
    // ---------- IMAGE & PDF ----------
    if (isImage.value || isPdf.value) {
      let blob;

      if (file.rawFile) {
        blob = file.rawFile;
      } else {
        blob = await fetchFileAsBlob(file.path);
      }

      previewUrl.value = URL.createObjectURL(blob);
      loading.value = false;
      return;
    }

    // ---------- WORD ----------
    if (isWord.value) {
      let buffer;

      if (file.rawFile) {
        buffer = await file.rawFile.arrayBuffer();
      } else {
        const blob = await fetchFileAsBlob(file.path);
        buffer = await blob.arrayBuffer();
      }

      await renderAsync(buffer, wordPreviewContainer.value);
      loading.value = false;
      return;
    }

    // ---------- EXCEL ----------
    if (isExcel.value) {
      let buffer;

      if (file.rawFile) {
        buffer = await file.rawFile.arrayBuffer();
      } else {
        const blob = await fetchFileAsBlob(file.path);
        buffer = await blob.arrayBuffer();
      }

      const workbook = XLSX.read(new Uint8Array(buffer), { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];

      const rawHtml = XLSX.utils.sheet_to_html(sheet, {
        id: 'excel-preview-table'
      });

      excelHtml.value = `
        <div class="tw-overflow-auto tw-max-w-full">
          ${rawHtml}
        </div>
      `;

      loading.value = false;
      return;
    }

  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
}, { immediate: true });

/* ---------------------------------------------
 * Helpers
 --------------------------------------------- */
function close() {
  modelValue.value = false;
}

async function fetchFileAsBlob(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Error downloading file');
  return await response.blob();
}

/* ---------------------------------------------
 * Memory cleanup
 --------------------------------------------- */
watch(modelValue, (val) => {
  if (!val && previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value);
    previewUrl.value = null;
  }
});
</script>

<style>
#excel-preview-table {
  border-collapse: collapse;
  width: 100%;
  font-size: 13px;
}

#excel-preview-table td,
#excel-preview-table th {
  border: 1px solid #e5e7eb;
  padding: 6px 10px;
  white-space: nowrap;
}

#excel-preview-table tr:nth-child(even) {
  background: #f9fafb;
}

#excel-preview-table tr:hover {
  background: #f1f5f9;
}

#excel-preview-table th {
  background: #f3f4f6;
  font-weight: 600;
  text-align: left;
}
</style>
