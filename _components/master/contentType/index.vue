<template>
  <!--cell content-->
  <div :style="style">
    <!-- custom component -->
    <component
      v-if="component"
      v-show="!isLoading"      
      :is="component"
      v-bind="componentProps"
      v-on="componentEvents || {}"
    />
    <!-- default content -->
    <div v-if="!isComponent" v-show="!isLoading" class="ellipsis tw-flex-1 tw-min-w-1">
      <label v-html="val" :class="{ 'content-type-onclick':  isClickeable, 'cursor-pointer': isEditable }"></label>
      <!-- help tootlipt -->
      <q-tooltip v-if="getTooltip()">
        <div v-html="getTooltip()" />
        <label v-if="isClickeable" class="text-weight-bold">
          {{ $tr('isite.cms.label.clickToAction') }}
        </label>
      </q-tooltip>
    </div>
    <q-skeleton v-if="isLoading" animated type="text" />
  </div>
</template>
<script lang="ts">
import {defineComponent} from 'vue'
import controller from 'modules/qsite/_components/master/contentType/controller'

export default defineComponent({
  props: {
    col: {
      type: Object,
      default: () => ({})
    },
    row: {
      type: Object,
      default: () => ({})
    }, 
    val: {
      type: null as any, //could be string or object
      default: null
    }
  },
  setup(props, {emit}) {
    return controller(props, emit)
  }
})
</script>
<style lang="scss">
.content-type-onclick {
  color: #2067b0;
  cursor: pointer
}
.content-type-onclick:hover {
  border-bottom: 2px dotted #2067b0;
}
</style>
