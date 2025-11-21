<template>
  <q-dialog
    v-model="show"
    :class="`master-super-ctn master-dialog${customPosition ? '-custom' : ''}`"
    v-on="$attrs"
    :maximized="maximized"
    :persistent="persistent"
    :position="customPosition ? 'right' : 'standard'"
    :style="masterModalWidthSize"
  >
    <!--Content-->
    <div :id="id || 'masterModalContent'" :style="customPosition ? '' : `min-width: ${width}`"
         v-if="show" class="master-dialog__content round relative-position" :class="customClass">
      <!--Header-->
      <div :class="`master-dialog__header text-${color} row justify-between items-center`">
        <!--Title-->
        <div class="master-dialog__header-title row items-center">
          <q-icon v-if="icon" :name="icon" class="q-mr-sm" size="20px" />
          <b>{{ title }}</b>
        </div>
        <!--Close Button-->
        <div
          class="
           tw-absolute
           tw-right-0
           tw-mr-20
           tw-space-x-2"
        >
          <template
            v-for="(btn, keyBtn) in multiActions"
            :key="keyBtn"
          >
            <q-btn
              v-if="btn.props.vIf != undefined ? btn.props.vIf : true"
              v-bind="{ ...actionBtnProps, ...(btn.props || {}) }"
              @click="btn.action ? btn.action() : null"
            />
          </template>
        </div>
        <q-btn
          v-close-popup
          icon="fas fa-times"
          round
          color="blue-grey"
          unelevated
          class="btn-small"
          outline
          v-if="!hideCloseAction"
        />

      </div>
      <q-separator inset />
      <!--Slot content-->
      <div class="master-dialog__body">
        <slot />
      </div>
      <!--Actions Content-->
      <div class="master-dialog__actions" v-if="actions && actions.length">
        <div class="row justify-end q-gutter-sm">
          <template
            v-for="(btn, keyBtn) in actions"
            :key="keyBtn"
          >
            <q-btn
              v-if="btn.props.vIf != undefined ? btn.props.vIf : true"
              v-bind="{ ...actionBtnProps, ...(btn.props || {}) }"
              @click="btn.action ? btn.action() : null"
              :loading="btn.props.loading != undefined ? btn.props.loading : false"
            />
          </template>

        </div>
      </div>
      <!--Loading-->
      <inner-loading :visible="loading" />
    </div>
  </q-dialog>
</template>

<script lang="ts">
import {
  ref,
  watch,
  reactive,
  onMounted,
  computed,
  defineComponent,
  onBeforeMount
} from 'vue';

export default defineComponent({
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
    multiActions: { type: Array, default: () => [] }
  },
  setup(props, { emit }) {
    const show = ref(false);
    const multiActions: any = computed(() => props.multiActions);
    watch(
      () => props.modelValue,
      (newValue, oldValue) => {
        if (newValue !== oldValue) {
          show.value = newValue;
        }
      }
    );

    watch(
      show,
      (newValue, oldValue) => {
        if (newValue !== oldValue) {
          emit('update:modelValue', newValue);
        }
      }
    );

    const actionBtnProps = reactive({
      rounded: true,
      unelevated: true,
      noCaps: true,
      class: 'btn-small'
    });

    const masterModalWidthSize = computed(() => ({ '--modal-width-size': props.modalWidthSize }));
    onBeforeMount(() => {
      show.value = false;
    })
    return {
      show,
      actionBtnProps,
      masterModalWidthSize,
      multiActions
    };
  }
});
</script>

<style lang="scss">
.master-super-ctn {
  .master-dialog {
    &__content {
      background: #eef2f4;
    }

    &__header {
      padding: 16px;
      font-size: 16px;
      background: white;
    }

    &__body {
      padding: 0 6px 0 16px;
      margin: 16px 0;
      overflow-y: scroll;
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

  .master-dialog-custom {
    .q-dialog__inner {
      padding: 15px 0 0 0;
      width: var(--modal-width-size) !important;

      @media screen and (max-width: $breakpoint-md) {
        width: 90vw !important;
      }

      @media screen and (max-width: $breakpoint-xs) {
        width: 100vw !important;
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
        height: calc(100vh - 157px);
      }
    }
  }
}
</style>
