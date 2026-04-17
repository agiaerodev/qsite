import { ref, watch, computed, nextTick } from 'vue';
import { debounce } from 'lodash';

// ==============================
// CONFIGURATION
// ==============================
export const ruleOptions = [
  { label: 'Required', value: 'required' },
  { label: 'Minimum Value', value: 'min' },
  { label: 'Maximum Value', value: 'max' },
  { label: 'Minimum Length', value: 'minLength' },
  { label: 'Maximum Length', value: 'maxLength' },
  { label: 'Custom JS', value: 'custom' },
];

export const ruleIcons = {
  required: 'fa-solid fa-circle-exclamation',
  min: 'fa-solid fa-arrow-up-9-1',
  max: 'fa-solid fa-arrow-down-1-9',
  minLength: 'fa-solid fa-text-width',
  maxLength: 'fa-solid fa-text-height',
  custom: 'fa-solid fa-gears',
};

// ==============================
// HELPERS
// ==============================
export const needsValue = (type) =>
  ['min', 'max', 'minLength', 'maxLength'].includes(type);

export const getDefaultMessage = (rule) => {
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

export const generateRuleString = (rule) => {
  if (rule.type === 'custom') return rule.code || null;

  // Validate that value is provided for rules that need it
  if (
    needsValue(rule.type) &&
    (rule.value === null || rule.value === undefined || rule.value === '')
  ) {
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

export function parseRuleString(ruleStr) {
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
// COMPOSITION FUNCTION
// ==============================
export function useFilterRulesController(props, emit) {
  const mode = ref('builder');
  const rules = ref([]);
  const isUpdatingFromEditor = ref(false);
  const isUpdatingFromWatcher = ref(false);

  // ==============================
  // COMPUTED
  // ==============================
  const canAddMoreRules = computed(() => {
    // Check if all current rules have valid values
    const allRulesValid = rules.value.every((rule) => {
      if (needsValue(rule.type)) {
        return (
          rule.value !== null && rule.value !== undefined && rule.value !== ''
        );
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

  const codeString = computed(() => {
    const safeArray = Array.isArray(props.modelValue) ? props.modelValue : [];
    return safeArray.length ? `[\n  ${safeArray.join(',\n  ')}\n]` : '[]';
  });

  // ==============================
  // METHODS
  // ==============================
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

  // ==============================
  // WATCHERS
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

  return {
    mode,
    rules,
    canAddMoreRules,
    codeString,
    getAvailableOptions,
    addRule,
    removeRule,
    handleEditorChange,
    needsValue,
  };
}

