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
        <div class="tw-relative">
          <q-input
            v-if="needsValue(rule.type)"
            v-model.number="rule.value"
            type="number"
            dense
            outlined
            class="tw-w-24"
            placeholder="Value"
            bg-color="white"
            :error="
              rule.value === null ||
              rule.value === undefined ||
              rule.value === ''
            "
            lazy-rules
            hide-bottom-space
          >
            <template v-slot:prepend>
              <q-icon name="fa-solid fa-hashtag" size="xs" color="grey-6" />
            </template>
          </q-input>
          <q-tooltip
            v-if="
              rule.value === null ||
              rule.value === undefined ||
              rule.value === ''
            "
          >
            Value is required
          </q-tooltip>
        </div>

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
        <q-tooltip
          >Complete numeric values for all rules that require them</q-tooltip
        >
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
import { onBeforeUnmount } from 'vue';
import {
  useFilterRulesController,
  ruleOptions,
  ruleIcons,
  needsValue,
} from '../controllers/filterRules.js';

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
// CONTROLLER
// ==============================
const {
  mode,
  rules,
  canAddMoreRules,
  codeString,
  getAvailableOptions,
  addRule,
  removeRule,
  handleEditorChange,
} = useFilterRulesController(props, emit);

// ==============================
// CLEANUP
// ==============================

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
