<template>
  <div class="row col-12">
    <!-- Modal -->
    <q-dialog
      v-model="model"
      persistent
      maximized
      position="right"
      :seamless="draggingFilter"
    >
      <q-card
        style="width: 350px;"
        v-if="filter"
        v-show="!draggingFilter"
      >
        <!-- Header -->
        <div>
          <div class="row justify-between items-center q-pa-md">
            <!--Title-->
            <div class="text-subtitle1 row items-center text-blue-grey">
              <q-icon name="fa-light fa-filter" size="20px" class="q-mr-sm"/>
              <label class="text-weight-bold">{{ $trp('isite.cms.label.filter', {capitalize: true}) }}</label>
              <speechField
                v-if="speech?.api"
                class="tw-ml-1"
                @response="loadFiltersFromAIResponse"
                v-bind="speech"
                :label="$trp('isite.cms.label.filter', {capitalize: true})"
              />
            </div>
            <!-- Close icon -->
            <q-icon name="fas fa-times" color="blue-grey" size="20px" class="cursor-pointer" @click="hideModal()"/>
          </div>
          <q-separator class="tw-h-0.5" />
        </div>

        <!--Filters-->
        <q-scroll-area class="tw-mt-3.5" style="height: calc(100vh - 153px)">
          <div class="q-px-sm" style="height: calc(100vh - 253px)">
            <!--Fields-->
            <draggable
              :list="filterItems"
              item-key="key"
              :group="{ name: 'dynamic-filters', pull: 'clone', put: false }"
              :sort="false"
              draggable=".dynamic-filter-draggable"
              handle=".dynamic-filter-drag-handle"
              :clone="cloneFilterItem"
              @start="handleFilterDragStart"
              @end="handleFilterDragEnd"
            >
              <template #item="{ element }">
                <div
                  class="dynamic-filter-item row no-wrap items-start"
                  :class="{ 'dynamic-filter-draggable': !element.field.quickFilter }"
                >
                  <q-icon
                    v-if="!element.field.quickFilter"
                    name="fa-light fa-grip-dots-vertical"
                    class="dynamic-filter-drag-handle text-blue-grey-5 q-mr-xs q-mt-sm cursor-grab"
                    size="16px"
                  />
                  <div class="col">
                    <dynamic-field
                      v-model="filterValues[element.field.name || element.key]"
                      :field="element.field"
                      class="q-mb-sm"
                      :enableCache="dynamicFieldCache"
                      @inputReadOnly="data => setInputReadOnly((element.field.name || element.key), data)"
                    />
                  </div>
                </div>
              </template>
            </draggable>
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
    <div class="col-12 tw-mt-1" v-if="showFilters || (Object.keys(readValues).length > 0) || (Object.keys(quickFilters).length > 0)" >
      <!-- show only desktop -->
      <div class="text-blue-grey ellipsis text-caption items-center row" v-if="showFilters">
        <!-- summary button -->
        <q-btn flat no-caps @click="showModal()">
          <q-icon name="fa-light fa-filter" class="q-mr-xs" color="amber" size="18px" />
          <b>{{ $trp('isite.cms.label.filter') }}:</b>
        </q-btn>
        <speechField
          v-if="speech?.api"
          class="tw-ml-1"
          @response="loadFiltersFromAIResponse"
          v-bind="speech"
          :label="$trp('isite.cms.label.filter', {capitalize: true})"
        />
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
      <draggable
        v-model="quickFilterItems"
        item-key="key"
        :class="['row', 'q-col-gutter-md', 'q-pt-sm', 'quick-filters-dropzone', { 'quick-filters-dropzone--active': draggingFilter }]"
        :group="{ name: 'dynamic-filters', pull: false, put: true }"
        draggable=".dynamic-quick-filter-draggable"
        handle=".dynamic-quick-filter-drag-handle"
        v-show="showFilters"
        @add="handleQuickFilterAdd"
        @change="handleQuickFilterChange"
      >
        <template #item="{ element }">
          <div class="dynamic-quick-filter-draggable row no-wrap items-start">
            <q-icon
              name="fa-light fa-grip-dots-vertical"
              class="dynamic-quick-filter-drag-handle text-blue-grey-5 q-mr-xs q-mt-sm cursor-grab"
              size="16px"
            />
            <div :class="element.field?.quickFilterClass ? element.field.quickFilterClass : 'col-12 col-md-2'">
              <dynamic-field
                v-model="quickFilterValues[element.key]"
                :keyField="element.key"
                :field="element.field"
                @update:modelValue="quickFilterHandler(element.key)"
              />
            </div>
          </div>
        </template>
      </draggable>
    </div>
  </div>
</template>
<script lang="ts">
import {defineComponent} from 'vue'
import controller from '@imagina/qsite/_components/master/dynamicFilter/controller'
import filterChip from '@imagina/qsite/_components/master/dynamicFilter/components/filterChip'
import speechField from '../speechField'
import draggable from 'vuedraggable'

export default defineComponent({
  props: {    
    systemName: {default: ''},
    filters: {type: Object, default: null},    
    modelValue: { default: false},
    showOnMobile: { default: false},
    speech: {
      type: Object,
      default: () => ({
        api: '',
        extraPrompts: {},
      })
    },
  },
  emits:['update:modelValue', 'hideModal', 'showModal', 'update:summary'],
  components: {
    filterChip,
    speechField,
    draggable
  },
  setup(props, {emit}) {
    return controller(props, emit)
  }
})
</script>
<style lang="scss">
.quick-filters-dropzone {
  min-height: 52px
}

.quick-filters-dropzone--active {
  border: 1px dashed var(--q-primary);
  background: rgba(25, 118, 210, 0.05);
}

.dynamic-filter-drag-handle {
  cursor: grab;
}

.dynamic-filter-drag-handle:active {
  cursor: grabbing;
}

.dynamic-quick-filter-drag-handle {
  cursor: grab;
}

.dynamic-quick-filter-drag-handle:active {
  cursor: grabbing;
}
</style>
