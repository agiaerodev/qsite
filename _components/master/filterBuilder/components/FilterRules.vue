<template>
  <div class="tw-px-6 tw-pb-4">
    <div class="tw-flex tw-items-center tw-justify-between tw-mb-2">
      <label class="tw-text-xs tw-font-bold tw-text-slate-500 tw-uppercase">
        Validation Rules (JavaScript)
      </label>
      <q-badge color="indigo-1" text-color="indigo" label="JS Array" />
    </div>

    <div class="tw-border tw-border-slate-200 tw-rounded-lg tw-overflow-hidden">
      <MonacoEditor
        v-model:value="codeString"
        theme="vs"
        :options="editorOptions"
        language="javascript"
        width="100%"
        height="200"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import MonacoEditor from 'monaco-editor-vue3';

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['update:modelValue']);

const codeString = ref('');
const isUpdatingFromEditor = ref(false);

const editorOptions = {
  automaticLayout: true,
  minimap: { enabled: false },
  fontSize: 12,
  lineNumbers: 'on',
  scrollBeyondLastLine: false,
};

// ==============================
// PROP → EDITOR
// ==============================
watch(
  () => props.modelValue,
  (newVal) => {
    if (isUpdatingFromEditor.value) return;

    const safeArray = Array.isArray(newVal)
      ? newVal.filter(r => typeof r === 'string' && r.trim() !== '')
      : [];

    const formattedValue =
      safeArray.length > 0
        ? `[\n  ${safeArray.map(r => r).join(',\n  ')}\n]`
        : `[]`;

    if (codeString.value !== formattedValue) {
      codeString.value = formattedValue;
    }
  },
  { immediate: true }
);

// ==============================
// EDITOR → PROP
// ==============================
watch(codeString, (newCode) => {
  isUpdatingFromEditor.value = true;

  if (!newCode || newCode.trim() === '') {
    emit('update:modelValue', []);
    isUpdatingFromEditor.value = false;
    return;
  }

  try {
    const result = new Function(`return ${newCode}`)();

    if (!Array.isArray(result)) {
      emit('update:modelValue', []);
    } else {
      // 🔥 CONVERTIR TODO A STRING
      const cleanRules = result
        .map(r => {
          if (typeof r === 'function') return r.toString();
          if (typeof r === 'string') return r;
          return null;
        })
        .filter(r => r !== null);

      emit('update:modelValue', cleanRules);
    }
  } catch (e) {
    // mientras escribe, ignorar
  }

  setTimeout(() => {
    isUpdatingFromEditor.value = false;
  }, 0);
});
</script>
