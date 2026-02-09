// controller.ts
import { ref, computed, nextTick, type Ref } from 'vue';
import { renderAsync } from 'docx-preview';
import * as XLSX from 'xlsx';
import baseService from 'modules/qcrud/_services/baseService.js';
import { eventBus, helper, alert } from '../../../../../plugins/utils';

/* ---------------------------------------------
 * Types
 --------------------------------------------- */
export interface UploadedFile {
  name: string;
  isImage: boolean;
  previewUrl: string | null;
  icon: string;
  color: string;
  rawFile: File;
  uploading: boolean;
  id: number | null;
}

export interface ControllerProps {
  modelValue: UploadedFile[];
  acceptedExtensions: string;
  maxFiles: number;
}

/* ---------------------------------------------
 * Controller
 --------------------------------------------- */
export function useFileController(
  props: ControllerProps,
  emit: (event: 'update:modelValue', value: UploadedFile[]) => void
) {
  /* ---------------------------------------------
   * State
   --------------------------------------------- */
  const showModal = ref(false);
  const activeFile = ref<UploadedFile | null>(null);
  const wordPreviewContainer = ref<HTMLElement | null>(null);
  const excelHtml = ref('');

  /* ---------------------------------------------
   * Computed
   --------------------------------------------- */
  const selectedFiles = computed<UploadedFile[]>({
    get: () => props.modelValue,
    set: (val) => emit('update:modelValue', val)
  });

  const isPdf = computed(
    () => activeFile.value?.name.toLowerCase().endsWith('.pdf') ?? false
  );

  const isWord = computed(
    () => activeFile.value?.name.toLowerCase().endsWith('.docx') ?? false
  );

  const isExcel = computed(
    () => activeFile.value?.name.toLowerCase().endsWith('.xlsx') ?? false
  );

  /* ---------------------------------------------
   * Preview Logic
   --------------------------------------------- */
  async function openPreview(file: UploadedFile) {
    activeFile.value = file;
    showModal.value = true;
    excelHtml.value = '';

    await nextTick();

    if (isWord.value && wordPreviewContainer.value) {
      await renderAsync(file.rawFile, wordPreviewContainer.value);
      return;
    }

    if (isExcel.value) {
      renderExcel(file.rawFile);
    }
  }

  function closePreview() {
    showModal.value = false;
    activeFile.value = null;
  }

  function renderExcel(file: File) {
    const reader = new FileReader();

    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      excelHtml.value = XLSX.utils.sheet_to_html(worksheet);
    };

    reader.readAsArrayBuffer(file);
  }

  /* ---------------------------------------------
   * Upload Logic
   --------------------------------------------- */
  async function onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (selectedFiles.value.length >= props.maxFiles) {
      alert.warning(`You can only upload a maximum of ${props.maxFiles} files.`);
      input.value = '';
      return;
    }

    if (!validateExtension(file)) {
      input.value = '';
      return;
    }

    let finalFile = file;
    const isImage = file.type.startsWith('image/');

    if (isImage) {
      try {
        const base64 = await helper.getBase64(file);
        const cropped = await cropper(base64);
        finalFile = base64ToFile(cropped.base64, file.name);
      } catch {
        return;
      }
    }

    const metadata = resolveFileMetadata(finalFile);

    const tempFile: UploadedFile = {
      name: finalFile.name,
      isImage: metadata.isImage,
      previewUrl:
        metadata.isImage || finalFile.name.toLowerCase().endsWith('.pdf')
          ? URL.createObjectURL(finalFile)
          : null,
      icon: metadata.icon,
      color: metadata.color,
      rawFile: finalFile,
      uploading: true,
      id: null
    };

    selectedFiles.value.push(tempFile);
    const index = selectedFiles.value.length - 1;

    try {
      const formData = new FormData();
      formData.append('file', finalFile);

      const response = await baseService.post(
        'apiRoutes.qsite.files',
        formData
      );

      selectedFiles.value[index] = {
        ...tempFile,
        uploading: false,
        id: response?.data?.id ?? null
      };
    } catch (error) {
      alert.error(error);
      selectedFiles.value.splice(index, 1);
    }

    input.value = '';
  }

  /* ---------------------------------------------
   * Helpers
   --------------------------------------------- */
  function removeFile(index: number) {
    selectedFiles.value = selectedFiles.value.filter((_, i) => i !== index);
  }

  function validateExtension(file: File): boolean {
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();

    if (!extension || !props.acceptedExtensions.includes(extension)) {
      alert.warning(`File not allowed: ${file.name}`);
      return false;
    }

    return true;
  }

  function base64ToFile(base64: string, filename: string): File {
    if (!base64.startsWith('data:')) {
      base64 = 'data:image/png;base64,' + base64;
    }

    const [header, data] = base64.split(',');
    const mime =
      header.match(/data:(.*?);base64/)?.[1] ?? 'image/png';

    const bytes = atob(data);
    const buffer = new Uint8Array(bytes.length);

    for (let i = 0; i < bytes.length; i++) {
      buffer[i] = bytes.charCodeAt(i);
    }

    return new File([buffer], filename, { type: mime });
  }

  function cropper(base64: string): Promise<{ base64: string }> {
    return new Promise((resolve) => {
      eventBus.emit('master.cropper.image', {
        src: base64,
        type: 'image/png',
        ratio: 'free',
        callBack: resolve
      });
    });
  }

  function resolveFileMetadata(file: File) {
    if (file.type.startsWith('image/')) {
      return { isImage: true, icon: '', color: '' };
    }

    const name = file.name.toLowerCase();

    if (name.endsWith('.pdf'))
      return {
        isImage: false,
        icon: 'fa-solid fa-file-pdf',
        color: '#ff5252'
      };

    if (name.endsWith('.xls') || name.endsWith('.xlsx'))
      return {
        isImage: false,
        icon: 'fa-solid fa-file-excel',
        color: '#2ecc71'
      };

    if (name.endsWith('.doc') || name.endsWith('.docx'))
      return {
        isImage: false,
        icon: 'fa-solid fa-file-word',
        color: '#3498db'
      };

    return {
      isImage: false,
      icon: 'fa-solid fa-file',
      color: '#5c6bc0'
    };
  }

  /* ---------------------------------------------
   * Expose API
   --------------------------------------------- */
  return {
    // state
    showModal,
    activeFile,
    wordPreviewContainer,
    excelHtml,

    // computed
    selectedFiles,
    isPdf,
    isWord,
    isExcel,

    // actions
    openPreview,
    closePreview,
    onFileChange,
    removeFile
  };
}
