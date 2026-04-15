<template>
  <div class="filter-rules tw-bg-white tw-rounded-lg tw-mx-6">
    <!-- HEADER -->
    <div
      class="tw-flex tw-items-center tw-justify-between tw-mb-4 tw-p-1 tw-bg-slate-50 tw-rounded-lg tw-border tw-border-slate-100"
    >
      <div class="tw-flex tw-items-center tw-gap-2 tw-ml-2">
        <q-icon name="fa-solid fa-shield-halved" color="primary" size="xs" />
        <span
          class="tw-text-xs tw-font-bold tw-text-slate-600 tw-uppercase tw-tracking-tight"
        >
          Validation Rules
        </span>
      </div>

      <q-btn-toggle
        v-model="mode"
        toggle-color="primary"
        flat
        dense
        unelevated
        size="sm"
        :options="[
          { label: 'Builder', value: 'builder', icon: 'fa-solid fa-hammer' },
        ]"
      />
    </div>

    <!-- ===================== -->
    <!-- 🟢 BUILDER MODE -->
    <!-- ===================== -->
    <div v-if="mode === 'builder'" class="tw-space-y-2">
      <div
        v-for="(rule, index) in rules"
        :key="index"
        class="tw-group tw-flex tw-flex-wrap tw-gap-2 tw-items-center tw-p-2 tw-bg-white tw-rounded-lg tw-border tw-border-slate-200 hover:tw-border-primary/30 tw-transition-colors"
      >
        <!-- RULE TYPE -->
        <q-select
          v-model="rule.type"
          :options="getAvailableOptions(rule.type)"
          dense
          outlined
          emit-value
          map-options
          class="tw-w-48"
          bg-color="white"
        >
          <template v-slot:prepend>
            <q-icon :name="ruleIcons[rule.type]" size="xs" color="primary" />
          </template>
        </q-select>

        <!-- VALUE (If applicable) -->
        <q-input
          v-if="needsValue(rule.type)"
          v-model.number="rule.value"
          type="number"
          dense
          outlined
          class="tw-w-24"
          placeholder="Value"
          bg-color="white"
          :rules="[val => val !== null && val !== undefined && val !== '' || 'Value is required']"
          lazy-rules
        >
          <template v-slot:prepend>
            <q-icon name="fa-solid fa-hashtag" size="xs" color="grey-6" />
          </template>
        </q-input>

        <!-- CUSTOM MESSAGE -->
        <q-input
          v-if="rule.type !== 'custom'"
          v-model="rule.message"
          dense
          outlined
          class="tw-flex-1"
          placeholder="Error message (optional)"
          bg-color="white"
        >
          <template v-slot:prepend>
            <q-icon name="fa-solid fa-comment-dots" size="xs" color="grey-6" />
          </template>
        </q-input>

        <!-- DELETE -->
        <q-btn
          icon="fa-solid fa-trash-can"
          flat
          round
          dense
          color="negative"
          size="sm"
          class="tw-opacity-40 group-hover:tw-opacity-100 tw-transition-opacity"
          @click="removeRule(index)"
        >
          <q-tooltip>Delete rule</q-tooltip>
        </q-btn>

        <!-- CUSTOM JS EDITOR (Textarea) -->
        <div
          v-if="rule.type === 'custom'"
          class="tw-w-full tw-mt-2 tw-pt-2 tw-border-t tw-border-dashed tw-border-slate-100"
        >
          <q-input
            v-model="rule.code"
            type="textarea"
            rows="5"
            dense
            outlined
            placeholder="val => { const valor = 1; return val == valor; }"
            bg-color="slate-50"
            class="tw-font-mono tw-text-xs tw-text-slate-700"
          >
            <template v-slot:prepend>
              <q-icon
                name="fa-solid fa-laptop-code"
                size="xs"
                class="tw-mt-1"
              />
            </template>
          </q-input>
        </div>
      </div>

      <!-- ADD RULE BUTTON -->
      <q-btn
        v-if="canAddMoreRules"
        label="Add Rule"
        icon="fa-solid fa-plus"
        flat
        no-caps
        color="primary"
        class="tw-w-full tw-border-2 tw-border-dashed tw-border-slate-200 tw-rounded-lg tw-py-2 hover:tw-bg-primary/5 tw-transition-all"
        @click="addRule"
      />
      <q-btn
        v-else
        label="Complete all required fields"
        icon="fa-solid fa-lock"
        flat
        no-caps
        disable
        color="grey-6"
        class="tw-w-full tw-border-2 tw-border-dashed tw-border-slate-200 tw-rounded-lg tw-py-2 tw-cursor-not-allowed"
      >
        <q-tooltip>Complete numeric values for all rules that require them</q-tooltip>
      </q-btn>
    </div>

    <!-- ===================== -->
    <!-- 🔴 CODE MODE -->
    <!-- ===================== -->
    <div v-else class="tw-relative">
      <div class="tw-absolute tw-right-2 tw-top-2 tw-z-10">
        <q-badge color="amber" text-color="black" label="JS Editor" />
      </div>
      <textarea
        :value="codeString"
        @input="handleEditorChange"
        class="tw-w-full tw-p-4 tw-font-mono tw-text-sm tw-border tw-border-slate-800 tw-rounded-lg tw-bg-slate-900 tw-text-emerald-400 focus:tw-outline-none focus:tw-ring-2 focus:tw-ring-primary/50 tw-resize-none"
        style="height: 250px"
        spellcheck="false"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, onBeforeUnmount, nextTick } from 'vue';
import { debounce } from 'lodash';

// ==============================
// PROPS / EMITS
// ==============================
const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['update:modelValue', 'update:rules']);

// ==============================
// CONFIGURATION
// ==============================
const ruleOptions = [
  { label: 'Required', value: 'required' },
  { label: 'Minimum Value', value: 'min' },
  { label: 'Maximum Value', value: 'max' },
  { label: 'Minimum Length', value: 'minLength' },
  { label: 'Maximum Length', value: 'maxLength' },
  { label: 'Custom JS', value: 'custom' },
];

const ruleIcons = {
  required: 'fa-solid fa-circle-exclamation',
  min: 'fa-solid fa-arrow-up-9-1',
  max: 'fa-solid fa-arrow-down-1-9',
  minLength: 'fa-solid fa-text-width',
  maxLength: 'fa-solid fa-text-height',
  custom: 'fa-solid fa-gears',
};

// ==============================
// STATE
// ==============================
const mode = ref('builder');
const rules = ref([]);
const isUpdatingFromEditor = ref(false);
const isUpdatingFromWatcher = ref(false);

// ==============================
// COMPUTED / METHODS
// ==============================
const needsValue = (type) =>
  ['min', 'max', 'minLength', 'maxLength'].includes(type);

const canAddMoreRules = computed(() => {
  // Check if all current rules have valid values
  const allRulesValid = rules.value.every(rule => {
    if (needsValue(rule.type)) {
      return rule.value !== null && rule.value !== undefined && rule.value !== '';
    }
    return true;
  });

  if (!allRulesValid) return false;

  const selectedTypes = rules.value
    .map((r) => r.type)
    .filter((t) => t !== 'custom');
  const availableTypes = ruleOptions.filter(
    (opt) => opt.value === 'custom' || !selectedTypes.includes(opt.value)
  );
  return availableTypes.length > 0;
});

// Filter out options already selected (except 'custom' which can be used multiple times)
const getAvailableOptions = (currentType) => {
  const selectedTypes = rules.value
    .map((r) => r.type)
    .filter((t) => t !== 'custom');

  return ruleOptions.map((opt) => ({
    ...opt,
    disable:
      opt.value !== 'custom' &&
      selectedTypes.includes(opt.value) &&
      opt.value !== currentType,
  }));
};

const addRule = () => {
  const selectedTypes = rules.value
    .map((r) => r.type)
    .filter((t) => t !== 'custom');

  const nextAvailable = ruleOptions.find(
    (opt) => opt.value === 'custom' || !selectedTypes.includes(opt.value)
  );

  if (nextAvailable) {
    rules.value.push({
      type: nextAvailable.value,
      value: null,
      message: '',
      code: '',
    });
  }
};

const removeRule = (index) => {
  rules.value.splice(index, 1);
};

// ==============================
// LOGIC: GENERATION & PARSING
// ==============================
const getDefaultMessage = (rule) => {
  switch (rule.type) {
    case 'required':
      return 'Field is required';
    case 'min':
      return `Minimum value is ${rule.value}`;
    case 'max':
      return `Maximum value is ${rule.value}`;
    case 'minLength':
      return `Minimum length is ${rule.value} characters`;
    case 'maxLength':
      return `Maximum length is ${rule.value} characters`;
    default:
      return 'Invalid value';
  }
};

const generateRuleString = (rule) => {
  if (rule.type === 'custom') return rule.code || null;

  // Validate that value is provided for rules that need it
  if (needsValue(rule.type) && (rule.value === null || rule.value === undefined || rule.value === '')) {
    return null;
  }

  const msg = rule.message || getDefaultMessage(rule);

  switch (rule.type) {
    case 'required':
      return `val => !!val || '${msg}'`;
    case 'min':
      return `val => val >= ${rule.value} || '${msg}'`;
    case 'max':
      return `val => val <= ${rule.value} || '${msg}'`;
    case 'minLength':
      return `val => (val && val.length >= ${rule.value}) || '${msg}'`;
    case 'maxLength':
      return `val => (val && val.length <= ${rule.value}) || '${msg}'`;
    default:
      return null;
  }
};

function parseRuleString(ruleStr) {
  if (typeof ruleStr !== 'string') return null;

  // Extract the custom message from the rule string
  const messageMatch = ruleStr.match(/\|\|\s*['"`](.*?)['"`]/);
  const extractedMessage = messageMatch?.[1] || '';

  const base = {
    type: 'custom',
    message: extractedMessage,
    value: null,
    code: ruleStr,
  };

  // Detect simple rules to show them in builder
  if (ruleStr.includes('!!val'))
    return { ...base, type: 'required', message: extractedMessage, code: '' };

  const valueMatch = ruleStr.match(/>= (\d+)|<= (\d+)/);
  const value = valueMatch?.[1] || valueMatch?.[2] || null;

  if (ruleStr.includes('val >=') && !ruleStr.includes('length'))
    return { ...base, type: 'min', value, message: extractedMessage, code: '' };
  if (ruleStr.includes('val <=') && !ruleStr.includes('length'))
    return { ...base, type: 'max', value, message: extractedMessage, code: '' };
  if (ruleStr.includes('length >=') || ruleStr.includes('.length >='))
    return {
      ...base,
      type: 'minLength',
      value,
      message: extractedMessage,
      code: '',
    };
  if (ruleStr.includes('length <=') || ruleStr.includes('.length <='))
    return {
      ...base,
      type: 'maxLength',
      value,
      message: extractedMessage,
      code: '',
    };

  // If it has multiple lines or logic, keep as custom textarea
  return base;
}

// ==============================
// WATCHERS & EMITS
// ==============================
watch(
  rules,
  (newRules) => {
    if (isUpdatingFromEditor.value || isUpdatingFromWatcher.value) return;

    const stringRules = newRules.map(generateRuleString).filter(Boolean);

    isUpdatingFromWatcher.value = true;
    emit('update:modelValue', stringRules);
    emit('update:rules', JSON.parse(JSON.stringify(newRules)));

    nextTick(() => {
      isUpdatingFromWatcher.value = false;
    });
  },
  { deep: true }
);

watch(
  () => props.modelValue,
  (newVal) => {
    if (isUpdatingFromEditor.value || isUpdatingFromWatcher.value) return;

    const safeArray = Array.isArray(newVal) ? newVal : [];

    // Only update rules if the values are actually different
    const newRules = safeArray.map(parseRuleString).filter(Boolean);

    isUpdatingFromWatcher.value = true;
    rules.value = newRules;

    nextTick(() => {
      isUpdatingFromWatcher.value = false;
    });
  },
  { immediate: true }
);

// ==============================
// CODE EDITOR SYNC
// ==============================
const codeString = computed(() => {
  const safeArray = Array.isArray(props.modelValue) ? props.modelValue : [];
  return safeArray.length ? `[\n  ${safeArray.join(',\n  ')}\n]` : '[]';
});

const handleEditorChange = debounce((event) => {
  const newCode = event.target.value;
  try {
    isUpdatingFromEditor.value = true;
    const result = new Function(`return ${newCode}`)();

    if (Array.isArray(result)) {
      const clean = result
        .map((r) => (typeof r === 'function' ? r.toString() : r))
        .filter(Boolean);

      nextTick(() => {
        emit('update:modelValue', clean);
        rules.value = clean.map(parseRuleString).filter(Boolean);
        isUpdatingFromEditor.value = false;
      });
    }
  } catch (e) {
    isUpdatingFromEditor.value = false;
  }
}, 600);

onBeforeUnmount(() => {
  handleEditorChange.cancel();
});
</script>

<style scoped>
.filter-rules textarea {
  tab-size: 2;
  line-height: 1.5;
}
</style>
