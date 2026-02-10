import { ref, computed, watch, nextTick } from 'vue';
import { renderAsync } from 'docx-preview';
import * as XLSX from 'xlsx';

export default function useFilePreviewController(props, modelValue) {

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

  async function loadPreview(file) {
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

        if (wordPreviewContainer.value) {
          wordPreviewContainer.value.innerHTML = "";
          try {
            await renderAsync(buffer, wordPreviewContainer.value);
          } catch (e) {
            console.log(e);
          }
        }

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
  }

  /* ---------------------------------------------
   * Memory cleanup
   --------------------------------------------- */
  watch(modelValue, async (val) => {
    try {
      if (val && props.file) {
        await loadPreview(props.file);
      }

      if (!val && previewUrl.value) {
        URL.revokeObjectURL(previewUrl.value);
        previewUrl.value = null;
      }
    } catch (e) {
      console.log(e);
    }
  });

  return {
    wordPreviewContainer,
    excelHtml,
    loading,
    previewUrl,
    isImage,
    isPdf,
    isWord,
    isExcel,
    close,
    loadPreview
  };
}
