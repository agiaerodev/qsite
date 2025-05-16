<template>
  <div class="row col-12">
    <!-- Modal -->
    <q-dialog
      v-model="model"
      persistent
      maximized
      position="right"
    >
      <q-card style="width: 350px;" v-if="filter">
        <!-- Header -->
        <div>
          <div class="row justify-between items-center q-pa-md">
            <!--Title-->
            <div class="text-subtitle1 row items-center text-blue-grey">
              <q-icon name="fa-light fa-filter" size="20px" class="q-mr-sm"/>
              <label class="text-weight-bold">{{ $trp('isite.cms.label.filter', {capitalize: true}) }}</label>
            </div>
            <!-- Close icon -->
            <q-icon name="fas fa-times" color="blue-grey" size="20px" class="cursor-pointer" @click="hideModal()"/>
          </div>
          <q-separator class="tw-h-0.5" />
        </div>

        <!--Filters-->
        <q-scroll-area class="tw-mt-3.5" style="height: calc(100vh - 253px)">
          <div class="q-px-sm" style="height: calc(100vh - 253px)">
            <!--Fields-->
            <template v-for="(field, key) in filter.fields" :key="key">
              <dynamic-field
                v-model="filterValues[field.name || key]"
                :field="field"
                class="q-mb-sm"
                :enableCache="dynamicFieldCache"
                @inputReadOnly="data => setInputReadOnly((field.name || key), data)"
              />
            </template>
          </div>
        </q-scroll-area>

        <!-- Footer -->
        <div class="absolute-bottom text-center bg-white tw-p-3" ref="footerContent">
          <q-separator class="tw-mb-3"/>
          <q-btn
            :label="$tr('isite.cms.label.search')"
            color="primary"
            class="tw-w-full"
            no-caps
            unelevated
            rounded
            @click="emitValues(true)"
          />
        </div>
      </q-card>
    </q-dialog>

    <!-- summary message, only on mobile -->
    <div class="row col-12 q-pt-md" v-if="!showFilters && hasAppliedFilters">
      <q-btn flat no-caps bordered  @click="showModal()" class="full-width">
        <span class="text-blue-grey">
          <q-icon name="fa-light fa-filter" color="amber" size="18px" />
          &nbsp;
          {{ $tr('isite.cms.label.appliedFilters') }}
        </span>
      </q-btn>
    </div>

    <!-- Summary --->
    <div class="col-12 tw-mt-1" v-if="(Object.keys(readValues).length > 0) || (Object.keys(quickFilters).length > 0)" >
      <!-- show only desktop -->
      <div class="text-blue-grey ellipsis text-caption items-center row" v-if="showFilters">
        <!-- summary button -->
        <q-btn flat no-caps @click="showModal()">
          <q-icon name="fa-light fa-filter" class="q-mr-xs" color="amber" size="18px" />
          <b>{{ $trp('isite.cms.label.filter') }}:</b>
        </q-btn>
        <!-- summary chips -->
        <filterChip
          :summary="readValues"
          @remove="(itemKey) => removeReadValue(itemKey)"
        />
      </div>
      <!-- Hiden Filters -->
      <div v-if="Object.keys(hidenFields).length" v-show="false">
        <template v-for="(field, keyField) in hidenFields" :key="keyField">
          <dynamic-field
            :field="field"
            :keyField="keyField"
          />
        </template>
      </div>
      <!-- Quick Filters-->
      <div v-if="Object.keys(quickFilters).length" class="row q-col-gutter-md q-pt-sm" v-show="showFilters">
        <template v-for="(field, keyField) in quickFilters" :key="keyField">
          <dynamic-field
            v-model="quickFilterValues[keyField]"
            :keyField="keyField"
            :field="field"
            :class="[field?.quickFilterClass ? field.quickFilterClass : 'col-12 col-md-3']"
            @update:modelValue="quickFilterHandler(keyField)"
          />
        </template>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import {defineComponent} from 'vue'
import controller from '@imagina/qsite/_components/master/dynamicFilter/controller'
import filterChip from '@imagina/qsite/_components/master/dynamicFilter/components/filterChip'

export default defineComponent({
  props: {    
    systemName: {default: ''},
    filters: {type: Object, default: null},    
    modelValue: { default: false},
    showOnMobile: { default: false}
  },
  emits:['update:modelValue', 'hideModal', 'showModal', 'update:summary'],
  components: {
    filterChip
  },
  setup(props, {emit}) {
    return controller(props, emit)
  }
})
</script>
<style lang="stylus">
</style>
