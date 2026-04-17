<template>
  <div class="lg:tw-col-span-5">
    <div class="tw-sticky tw-top-8">
      <q-card flat class="tw-bg-[#0f172a] tw-rounded-3xl tw-overflow-hidden tw-shadow-2xl">
        <div class="tw-bg-[#1e293b]/50 tw-px-6 tw-py-4 tw-flex tw-items-center tw-justify-between tw-border-b tw-border-slate-700/50">
          <div class="tw-flex tw-items-center tw-gap-2">
            <div class="tw-flex tw-gap-1.5">
              <div class="tw-w-2.5 tw-h-2.5 tw-rounded-full tw-bg-red-500/80"></div>
              <div class="tw-w-2.5 tw-h-2.5 tw-rounded-full tw-bg-amber-500/80"></div>
              <div class="tw-w-2.5 tw-h-2.5 tw-rounded-full tw-bg-emerald-500/80"></div>
            </div>
            <span class="tw-ml-4 tw-font-mono tw-text-xs tw-text-slate-500 tw-tracking-widest">SCHEMA_EXPORT.JSON</span>
          </div>
          <q-btn @click="handleCopy" round flat color="indigo-4" icon="fa-light fa-copy" size="sm" />
        </div>
        <q-card-section class="tw-p-0">
          <pre class="tw-p-8 tw-text-[13px] tw-font-mono tw-overflow-auto tw-leading-relaxed tw-h-[650px] custom-scrollbar tw-text-indigo-200">{{ generatedJson }}</pre>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script setup>
defineProps({
  generatedJson: {
    type: String,
    required: true
  },
  handleCopy: {
    type: Function,
    required: true
  }
});
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #334155;
  border-radius: 10px;
}
pre {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
