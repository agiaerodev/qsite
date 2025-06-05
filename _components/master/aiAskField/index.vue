<template>
  <div>
    <div 
      v-show="!isOpenAiAsk" 
      class="tw-flex tw-justify-end tw-items-center tw-w-full tw-mb-2"
    >
      <span class="tw-mr-1.5 tw-font-semibold">AI</span>
      <i 
        class="fa-solid fa-sparkles tw-cursor-pointer tw-text-blue-400"
        @click="isOpenAiAsk = !isOpenAiAsk"
      ></i>
    </div>
    <div v-show="isOpenAiAsk" class="tw-flex">
      <dynamic-field
        class="tw-w-full field-sizing"
        :field="field.prompt"
        v-model="prompt"
      />
      <i 
        @click="startRecord" 
        class="
          fa-solid 
          fa-microphone 
          tw-cursor-pointer 
          tw-ml-3 
          tw-mt-5
          sm:tw-mt-3
          hover:tw-text-green-500
          tw-text-lg
          sm:tw-text-sm
        "
        :class="record ? 'tw-text-green-500' : 'tw-text-slate-500'"
      ></i>
      <i
        @click="sendPrompt"
        class="
          fa-solid 
          fa-paper-plane-top 
          tw-ml-3 
          tw-mt-5
          sm:tw-mt-3
          tw-text-slate-500 
          tw-cursor-pointer
          hover:tw-text-blue-500
          tw-text-lg
          sm:tw-text-sm
        "
      ></i>
      <i 
        class="
          fa-solid 
          fa-xmark 
          tw-cursor-pointer 
          tw-ml-5
          sm:tw-ml-3
          tw-mt-5 
          sm:tw-mt-3
          tw-text-slate-500
          hover:tw-text-red-500
          tw-text-lg
          sm:tw-text-sm
        "
        @click="closeAiAsk"
      ></i>
    </div>
  </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import controller from './controller'

export default defineComponent({
  props: {
    extraPrompts: {
      type: String,
    },
    api: {
      type: String,
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
.field-sizing textarea {
  // field-sizing: content;
}
</style>
