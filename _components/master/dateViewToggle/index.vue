<script lang="ts">
import { defineComponent } from 'vue'
import controller from './controller'

export default defineComponent({
  props: {
		modelValue: {      
			selectedDate: null,
			typeAgenda: null,
		}, 
  },
  components: {},
	emits:['update:modelValue'],
  setup(props, {emit}) {
    return controller(props, emit)
  }
})
</script>
<template>
	<div class="text-center">
		<q-btn-toggle
			v-model="typeAgenda"
			@update:model-value="handleChange"
			rounded
			no-caps
			unelevated
			spread
			toggle-color="primary"
			color="grey-2"
			text-color="primary"
			:options="scheduleType"
			id="btnCalendarType"
			size="14px"
			padding="sm sm"
		/>
	</div>
	<!--calendar-->
	<div class="text-center tw-py-4">
		<q-date class="text-primary shadow-4 custom_q_date"
			v-model="selectedDate"
			@update:model-value="handleChange"
			color="primary"
			minimal
			bordered
			today-btn
		/>
	</div>
</template>