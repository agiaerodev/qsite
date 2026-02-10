import { ref, computed, nextTick, onMounted } from 'vue';
import { renderAsync } from 'docx-preview';
import * as XLSX from 'xlsx';
import baseService from 'modules/qcrud/_services/baseService.js';
import { eventBus, helper, alert } from '../../../../../plugins/utils';

export function useFileUploadController(props, emit) {
  /* ---------------------------------------------
   * State
   --------------------------------------------- */
  const uploading = ref(false);
  const selectedFiles = ref([]);
  const showModal = ref(false);
  const activeFile = ref(null);
  const wordPreviewContainer = ref(null);
  const excelHtml = ref('');

  /* ---------------------------------------------
   * Computed
   --------------------------------------------- */
  const localFields = computed({
    get: () => props.modelValue,
    set: val => emit('update:modelValue', val)
  });

  const isPdf = computed(() => activeFile.value?.name?.toLowerCase().endsWith('.pdf'));
  const isWord = computed(() => activeFile.value?.name?.toLowerCase().endsWith('.docx'));
  const isExcel = computed(() => activeFile.value?.name?.toLowerCase().endsWith('.xlsx'));

  /* ---------------------------------------------
   * Preview Logic
   --------------------------------------------- */
  async function openPreview(file) {
    activeFile.value = file;
    showModal.value = true;
    excelHtml.value = '';

    await nextTick();

    if (isPdf.value) {
      if (!file.rawFile) {
        const blob = await fetchFileAsBlob(file.previewUrl);
        file.previewUrl = URL.createObjectURL(blob);
      }
      return;
    }

    if (isWord.value) {
      let source = file.rawFile;
      if (!source) {
        const blob = await fetchFileAsBlob(file.previewUrl || file.path);
        source = await blob.arrayBuffer();
      }
      await renderAsync(source, wordPreviewContainer.value);
      return;
    }

    if (isExcel.value) {
      let buffer;
      if (file.rawFile) buffer = await file.rawFile.arrayBuffer();
      else {
        const blob = await fetchFileAsBlob(file.previewUrl || file.path);
        buffer = await blob.arrayBuffer();
      }
      const workbook = XLSX.read(new Uint8Array(buffer), { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      excelHtml.value = XLSX.utils.sheet_to_html(sheet);
    }
  }

  function closePreview() {
    showModal.value = false;
    activeFile.value = null;
  }

  /* ---------------------------------------------
   * Upload Logic
   --------------------------------------------- */
  async function onFileChange(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (selectedFiles.value.length >= props.maxFiles) {
      alert.warning(`You can only upload a maximum of ${props.maxFiles} files.`);
      event.target.value = '';
      return;
    }

    if (!validateExtension(file)) {
      event.target.value = '';
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

    const tempFile = {
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
      uploading.value = true;
      emit('uploading', true);

      const form = new FormData();
      form.append('file', finalFile);

      const response = await baseService.post('apiRoutes.qsite.filesUploadWithDetails', form);

      selectedFiles.value[index] = { ...tempFile, uploading: false, id: response?.id ?? null };

      localFields.value = selectedFiles.value.map(f => f.id);
      uploading.value = false;
      emit('uploading', false);
    } catch (e) {
      selectedFiles.value.splice(index, 1);
      alert.error(e);
    }

    event.target.value = '';
  }

  /* ---------------------------------------------
   * Backend Sync
   --------------------------------------------- */
  async function getFields() {
    if (!localFields.value?.length) {
      selectedFiles.value = [];
      return;
    }

    const response = await baseService.index('apiRoutes.qsite.files', {
      refresh: true,
      params: { filter: { id: localFields.value } }
    });

    selectedFiles.value = response.data.map(file => {
      const ext = file.extension?.toLowerCase() || '';
      const isImage = ['.png', '.jpg', '.jpeg'].includes(ext);

      return {
        name: file.name,
        isImage,
        previewUrl: isImage || ext === '.pdf' ? file.path : null,
        icon: resolveIconByExtension(ext),
        color: resolveColorByExtension(ext),
        rawFile: null,
        uploading: false,
        id: file.id,
        path: file.path
      };
    });
  }

  /* ---------------------------------------------
   * Helpers
   --------------------------------------------- */
  function validateExtension(file) {
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!props.acceptedExtensions.includes(ext)) {
      alert.warning(`File not allowed: ${file.name}`);
      return false;
    }
    return true;
  }

  async function fetchFileAsBlob(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Error downloading file');
    return await response.blob();
  }

  function resolveFileMetadata(file) {
    const n = file.name.toLowerCase();
    if (file.type.startsWith('image/')) return { isImage: true, icon: 'fa-solid fa-file-image', color: '#7e57c2' };
    if (n.endsWith('.pdf')) return { isImage: false, icon: 'fa-solid fa-file-pdf', color: '#ff5252' };
    if (n.endsWith('.xls') || n.endsWith('.xlsx')) return {
      isImage: false,
      icon: 'fa-solid fa-file-excel',
      color: '#2ecc71'
    };
    if (n.endsWith('.doc') || n.endsWith('.docx')) return {
      isImage: false,
      icon: 'fa-solid fa-file-word',
      color: '#3498db'
    };
    return { isImage: false, icon: 'fa-solid fa-file', color: '#5c6bc0' };
  }

  function resolveIconByExtension(ext) {
    if (['.png', '.jpg', '.jpeg'].includes(ext)) return 'fa-solid fa-file-image';
    if (ext === '.pdf') return 'fa-solid fa-file-pdf';
    if (ext === '.xls' || ext === '.xlsx') return 'fa-solid fa-file-excel';
    if (ext === '.doc' || ext === '.docx') return 'fa-solid fa-file-word';
    return 'fa-solid fa-file';
  }

  function resolveColorByExtension(ext) {
    if (ext === '.pdf') return '#ff5252';
    if (ext === '.xls' || ext === '.xlsx') return '#2ecc71';
    if (ext === '.doc' || ext === '.docx') return '#3498db';
    if (['.png', '.jpg', '.jpeg'].includes(ext)) return '#7e57c2';
    return '#5c6bc0';
  }

  function base64ToFile(base64, filename) {
    const [header, data] = base64.split(',');
    const mime = header.match(/:(.*?);/)?.[1] || 'image/png';
    const bytes = atob(data);
    const arr = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
    return new File([arr], filename, { type: mime });
  }

  function cropper(base64) {
    return new Promise(resolve => {
      eventBus.emit('master.cropper.image', {
        src: base64,
        ratio: 'free',
        callBack: resolve
      });
    });
  }

  async function removeFile(index) {
    try {
      const id = selectedFiles.value[index]?.id;
      selectedFiles.value = selectedFiles.value.filter((_, i) => i !== index);
      localFields.value = selectedFiles.value.map(f => f.id);
      await baseService.delete('apiRoutes.qsite.files', id);
      alert.success('File removed successfully.');
    } catch (e) {
      alert.error(e);
    }
  }

  onMounted(async () => {
    await getFields();
  });
  return {
    uploading,
    selectedFiles,
    showModal,
    activeFile,
    wordPreviewContainer,
    excelHtml,
    isPdf,
    isWord,
    isExcel,
    openPreview,
    closePreview,
    onFileChange,
    getFields,
    removeFile
  };
}
