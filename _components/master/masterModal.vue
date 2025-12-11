<template>
  <q-dialog
    v-model="show"
    :class="`master-dialog${customPosition ? '-custom' : ''}`"
    v-on="$attrs"
    :maximized="maximized"
    :persistent="persistent"
    :position="customPosition ? 'right' : 'standard'"
    :style="masterModalWidthSize"
    :allow-focus-outside="true"
  >
    <!--Content-->
    <div :id="id || 'masterModalContent'" :style="customPosition ? '' : `min-width: ${width}`"
          v-if="show" class="master-dialog__content !tw-rounded-2xl relative-position" :class="customClass">
      <!--Header-->
      <div
        v-if="title || speech?.api || help?.description"
        :class="`master-dialog__header text-${color} row justify-between items-center`"
      >
        <!--Title-->
        <div class="master-dialog__header-title row items-center">
          <q-icon v-if="icon" :name="icon" class="q-mr-sm" size="20px" />
          <b>{{ title }}</b>
          <q-chip
            v-if="chip && !Array.isArray(chip)"
            class="tw-ml-3 tw-font-semibold tw-text-gray-500 tw-text-sm"
            v-bind="chip"
          />
          <div v-else-if="chip && Array.isArray(chip)"
            class="tw-flex tw-items-center tw-space-x-2 tw-text-xs tw-ml-3"
          >
            <div
              v-for="(c, i) in chip"
              :key="i"
              class="tw-flex tw-items-center tw-gap-1"
            >
              <q-icon :name="c.icon" class="tw-text-gray-500" size="10px" />

              <span class="tw-text-gray-500">
            {{ c.text }}
          </span>
              <q-chip
                dense
                square
                :class="c.class"
                class="tw-font-semibold tw-text-xs"
                size="sm"
              >
                {{ c.labelChip }}
              </q-chip>

              <div
                v-if="i < chip.length - 1"
                class="tw-border-r tw-border-gray-300 tw-h-4 tw-mx-1"
              />
            </div>
          </div>
          <speechField
            class="tw-ml-2"
            v-if="speech?.api"
            v-bind="speech"
            @response="$emit('speech-response', $event)"
            :label="title"
          />
          <help-text
            class="tw-ml-2"
            v-if="help?.description"
            v-bind="help"
          />
        </div>
        <!--Close Button-->
        <q-btn v-close-popup icon="fa-light fa-xmark" round textColor="blue-grey" unelevated class="btn-medium tw-absolute tw-top-0 lg:tw-top-[8px] tw-right-3 tw-z-50"
                v-if="!hideCloseAction" />
      </div>
      <q-separator class="tw-h-0.5" v-if="title || speech?.api || help?.description"/>
      <!--Slot content-->
      <div class="master-dialog__body">
        <slot />
      </div>
      <!--Actions Content-->
      <div class="master-dialog__actions" v-if="actions && actions.length">
        <div class="row justify-end q-gutter-sm">
          <template v-for="(btn, keyBtn) in actions" :key="keyBtn">
            <template v-if="!btn?.type || (btn?.type === 'button')">
              <q-btn
                v-if="btn.props?.vIf != undefined ? btn.props?.vIf : true"
                v-bind="{...actionBtnProps, ...(btn.props || {})}"
                @click="btn.action ? btn.action() : null"
                :loading="btn?.props?.loading || false"
              />
            </template>
            <q-btn-dropdown
              v-if="btn.props?.vIf && (btn?.type === 'dropdown')"
              v-bind="{...actionBtnProps, ...(btn.props || {})}"
              :loading="btn?.props?.loading || false"
            >
              <q-list>
                <template v-for="item in btn.items">
                  <q-item
                    clickable
                    v-close-popup
                    @click="item?.action"
                  >
                    <q-item-section>
                      <q-item-label>{{ item?.label }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
              </q-list>
            </q-btn-dropdown>
          </template>
        </div>
      </div>
      <!--Loading-->
      <inner-loading :visible="loading" />
    </div>
  </q-dialog>
</template>

<script>
import speechField from './speechField';

export default {
  props: {
    modelValue: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    persistent: { type: Boolean, default: false },
    color: { type: String, default: 'blue-grey' },
    width: { type: String, default: '400px' },
    title: { type: String },
    icon: { type: String },
    actions: { type: Array },
    id: { type: String },
    maximized: { type: Boolean, default: false },
    hideCloseAction: { type: Boolean, default: false },
    customPosition: { type: Boolean, default: false },
    modalWidthSize: { type: String, default: '65vw' },
    customClass: { type: String, default: '' },
    chip: { type: Object || null, default: null },
    help: { type: Object || null, default: null },
    speech: {
      type: Object || null,
      default: () => ({
        extraPrompts: {},
        api: ''
      })
    }
  },
  emits: ['update:modelValue', 'speech-response'],
  components: { speechField },
  watch: {
    modelValue(newValue, oldValue) {
      this.show = this.$clone(newValue);
    },
    show(newValue, oldValue) {
      this.$emit('update:modelValue', this.$clone(newValue));
    }
  },
  mounted() {
    this.$nextTick(function() {
    });
  },
  data() {
    return {
      show: false
    };
  },
  computed: {
    actionBtnProps() {
      return {
        rounded: true,
        unelevated: true,
        noCaps: true,
        class: 'btn-small'
      };
    },
    masterModalWidthSize() {
      return {
        '--modal-width-size': this.modalWidthSize
      };
    }
  },
  methods: {}
};
</script>

<style lang="scss">
.master-dialog {
  &__content {
    background: white;
  }

  &__header {
    padding: 16px;
    font-size: 16px;
    background: white;
  }

  &__body {
    padding: 0 16px;
    margin: 16px 0;
    overflow-y: auto;
  }

  &__actions {
    padding: 0 16px 8px 16px;

    .q-btn {
      .q-icon {
        font-size: 20px;
      }
    }
  }
}

.master-dialog .master-dialog__body {
  max-height: calc(100vh - 240px);

  @media screen and (max-width: $breakpoint-md) {
    max-height: calc(100vh - 150px);
  }
}

.master-dialog-custom{
  .q-dialog__inner {
    padding: 15px 0 0 0;
    width: var(--modal-width-size);

    @media screen and (max-width: $breakpoint-md) {
      width: 90vw;
    }

    @media screen and (max-width: $breakpoint-xs) {
      width: 100vw;
    }
  }

  .master-dialog {
    &__content {
      height: 100%;
      max-height: 100%;
      width: 100%;
      max-width: 100%;
      border-radius: $custom-radius 0 0 0 !important;
    }

    &__body {
      height: calc(100vh - 173px);
    }
  }
}
</style>
