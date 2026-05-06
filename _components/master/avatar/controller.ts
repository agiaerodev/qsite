import { ref } from 'vue';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AvatarProps {
  url?: string | null;
}

interface FileObject {
  name: string;
  url: string;
  path: string;
  previewUrl: string;
  isImage: boolean;
  isPdf: boolean;
  rawFile: null;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp']);
const PDF_EXTENSION = '.pdf';
const DEFAULT_EXTENSION = '.jpg';
const VALID_EXTENSION_REGEX = /^[a-z0-9]{2,5}$/;

// ─── Pure Utilities ───────────────────────────────────────────────────────────

/** Extracts and validates the file extension from a URL. Returns null if not found or invalid. */
function getExtensionFromUrl(url: string): string | null {
  const urlWithoutQuery = url.split('?')[0];
  const lastDotIndex = urlWithoutQuery.lastIndexOf('.');

  if (lastDotIndex === -1) return null;

  const rawExtension = urlWithoutQuery.slice(lastDotIndex + 1).toLowerCase();

  return VALID_EXTENSION_REGEX.test(rawExtension) ? `.${rawExtension}` : null;
}

/** Builds a FileObject from a given URL, inferring type from its extension. */
function buildFileObjectFromUrl(url: string): FileObject {
  const extension = getExtensionFromUrl(url) ?? DEFAULT_EXTENSION;

  return {
    name: `file_${Date.now()}${extension}`,
    url,
    path: url,
    previewUrl: url,
    isImage: IMAGE_EXTENSIONS.has(extension),
    isPdf: extension === PDF_EXTENSION,
    rawFile: null,
  };
}

// ─── Composable ───────────────────────────────────────────────────────────────

export default function useAvatarController(props: AvatarProps) {
  const isModalVisible = ref(false);
  const selectedFile = ref<FileObject | null>(null);

  /** Opens the preview modal with the file built from the current URL prop. */
  const handleClick = (): void => {
    if (!props.url) return;

    selectedFile.value = buildFileObjectFromUrl(props.url);
    isModalVisible.value = true;
  };

  /** Syncs the modal visibility state with the child component's emitted value. */
  const handleUpdateModal = (isVisible: boolean): void => {
    isModalVisible.value = isVisible;
  };

  return {
    isModalVisible,
    selectedFile,
    handleClick,
    handleUpdateModal,
  };
}
