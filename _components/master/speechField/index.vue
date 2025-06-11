<template>
  <div>
    <div v-show="!showPopup">
      <q-btn
        icon="fa-regular fa-sparkles tw-bg-gradient-to-r tw-from-indigo-500 tw-via-purple-500 tw-to-pink-500 tw-bg-clip-text tw-text-transparent"
        class="tw-mr-1"
        size="sm"
        round
        flat
      >
        <q-popup-edit
          ref="popupEdit"
          v-model="showPopup"
          @hide="closeAiAsk"
          class="
            !tw-max-h-none
            sm:tw-w-[550px]
            md:tw-w-[640px]
            tw-p-3
            tw-rounded-2xl
            tw-shadow-[0_20px_20px_15px_rgba(0,0,0,0.1),0_10px_10px_8px_rgba(0,0,0,0.04)]
            tw-shadow-purple-500/15
            tw-border-4
            tw-border-purple-500/10
            !tw-inset-x-2
            !tw-top-2
            sm:!tw-top-4
            sm:!tw-left-1/2
            sm:!-tw-translate-x-1/2
          "
        >
          <section class="tw-flex tw-items-center tw-gap-2">
            <i 
              :class="`
                fa-regular 
                fa-sparkles 
                tw-bg-gradient-to-r 
                tw-from-indigo-500 
                tw-via-purple-500 
                tw-to-pink-500 
                tw-bg-clip-text 
                tw-text-transparent
                ${loading ? 'fa-fade' : ''}
              `"
            ></i>
            <dynamic-field
              class="field-sizing"
              :field="field.prompt"
              v-model="prompt"
              @keydown.enter.prevent="sendPrompt"
            />
            <div class="tw-flex tw-items-center tw-gap-0.5">
              <div>
                <q-btn
                  @click="startRecord"
                  icon="fa-light fa-microphone"
                  class="hover:tw-text-green-500"
                  :class="record ? 'tw-text-green-500' : 'tw-text-slate-500'"
                  size="sm"
                  round
                  flat
                ></q-btn>
              </div>
              <div>
                <q-btn
                  @click="sendPrompt"
                  icon="fa-light fa-paper-plane-top"
                  :class="{
                    'tw-text-blue-600': isPrompt && !loading,
                    'tw-text-slate-500': !isPrompt || loading,
                    'hover:tw-text-blue-600': !loading
                  }"
                  size="sm"
                  round
                  flat
                ></q-btn>
              </div>
              <div class="tw-ml-2">
                <q-btn
                  @click="closeAiAsk"
                  icon="fa-light fa-xmark"
                  class="
                    tw-text-slate-500
                    hover:tw-text-red-600
                  "
                  size="sm"
                  round
                  flat
                ></q-btn>
              </div>
            </div>
          </section>
          <section>
            <q-btn
              v-show="isResponseAi"
              @click="rejectChange"
              class="
                tw-text-slate-500
                hover:tw-text-red-500
                tw-text-xs
                tw-px-2
                tw-ml-6
                tw-mt-1
              "
              flat
              rounded
              no-caps
            >
              Cancel
            </q-btn>
          </section>
        </q-popup-edit>
      </q-btn>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import controller from './controller'

export default defineComponent({
  props: {
    extraPrompts: {
      type: Object,
      default: () => ({})
    },
    api: {
      type: String,
      default: ''
    },
    label: String,
    fieldProps: {
      type: Object,
      default: () => ({})
    },
  },
  components: {},
  emits: ['response'],
  setup(props, { emit }) {
    return controller(props, emit)
  }
})
</script>
<style lang="scss">
.field-sizing {
  width: calc(100% - 133px);
}
.field-sizing textarea {
  field-sizing: content;
}
</style>
