<template>
  <q-slide-transition>
    <div
      v-if="currentFilter.type === 'select'"
      class="tw-border-t tw-border-slate-100"
    >
      <div class="tw-px-6 tw-pt-6">
        <q-tabs
          v-model="optionsSourceModel"
          dense
          class="tw-bg-slate-100 tw-rounded-xl tw-p-1"
          active-color="indigo"
          indicator-color="transparent"
          align="justify"
          no-caps
        >
          <q-tab name="api" class="tw-rounded-lg">
            <div class="tw-flex tw-items-center tw-gap-2">
              <q-icon name="fa-light fa-cloud-bolt" size="14px" />
              <span class="tw-font-bold">Remote API</span>
            </div>
          </q-tab>
          <q-tab name="static" class="tw-rounded-lg">
            <div class="tw-flex tw-items-center tw-gap-2">
              <q-icon name="fa-light fa-list-dropdown" size="14px" />
              <span class="tw-font-bold">Static List</span>
            </div>
          </q-tab>
        </q-tabs>
      </div>

      <q-tab-panels
        v-model="optionsSourceModel"
        animated
        class="tw-bg-transparent"
      >
        <q-tab-panel name="api" class="tw-p-6 tw-space-y-4">
          <q-input
            v-model="currentFilter.loadOptions.apiRoute"
            label="Endpoint URL"
            outlined
            dense
            placeholder="/v1/options"
            prefix="GET"
          />
          <div class="tw-grid tw-grid-cols-2 tw-gap-4">
            <q-input
              v-model="currentFilter.loadOptions.select.label"
              label="Label Key"
              outlined
              dense
              placeholder="name"
            />
            <q-input
              v-model="currentFilter.loadOptions.select.id"
              label="Value Key (ID)"
              outlined
              dense
              placeholder="uuid"
            />
          </div>
          <div class="tw-space-y-2">
            <div class="tw-text-xs tw-font-bold tw-text-slate-500">
              Request Parameters
            </div>
            <div class="tw-flex tw-gap-2">
              <q-input
                v-model="newRequestParam.name"
                label="Key"
                dense
                outlined
                class="tw-grow"
              />
              <q-select
                v-model="newRequestParam.type"
                :options="['string', 'json']"
                label="Type"
                dense
                outlined
                class="tw-w-32"
                emit-value
                map-options
              />
              <JsonEditorVue
                v-if="newRequestParam.type === 'json'"
                v-model="newRequestParam.value"
                class="tw-grow"
              />
              <q-input
                v-else
                v-model="newRequestParam.value"
                label="Value"
                dense
                outlined
                class="tw-grow"
              />
              <q-btn
                @click="$emit('add-request-param')"
                icon="fa-light fa-plus"
                color="indigo-7"
                unelevated
                class="tw-rounded-lg"
              />
            </div>
            <q-list
              bordered
              separator
              v-if="currentFilter.loadOptions.requestParams.length"
              class="tw-rounded-xl tw-overflow-hidden"
            >
              <q-item
                v-for="(param, pIdx) in currentFilter.loadOptions.requestParams"
                :key="pIdx"
                class="tw-bg-white hover:tw-bg-slate-50"
              >
                <q-item-section>
                  <div class="tw-flex tw-items-center tw-gap-2">
                    <q-item-label class="tw-font-medium">{{
                      param.name
                    }}</q-item-label>
                    <q-badge
                      v-if="param.type"
                      :label="param.type"
                      :color="param.type === 'json' ? 'orange' : 'grey'"
                      outline
                      rounded
                    />
                  </div>
                  <q-item-label caption class="tw-font-mono">{{
                    param.value
                  }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-btn
                    @click="removeRequestParam(pIdx)"
                    icon="fa-light fa-trash-xmark"
                    color="red-4"
                    flat
                    round
                    dense
                  />
                </q-item-section>
              </q-item>
            </q-list>
          </div>
        </q-tab-panel>

        <q-tab-panel name="static" class="tw-p-6">
          <div class="tw-flex tw-gap-3 tw-mb-4">
            <q-input
              v-model="newOption.label"
              label="Option Label"
              dense
              outlined
              class="tw-grow"
            />
            <q-input
              v-model="newOption.value"
              label="Value"
              dense
              outlined
              class="tw-grow"
            />
            <q-btn
              @click="$emit('add-static-option')"
              icon="fa-light fa-plus"
              color="indigo-7"
              unelevated
              class="tw-rounded-lg"
            />
          </div>
          <q-list
            v-if="
              currentFilter.staticOptions &&
              currentFilter.staticOptions.length > 0
            "
            bordered
            separator
            class="tw-rounded-xl tw-overflow-hidden"
          >
            <q-item
              v-for="(opt, idx) in currentFilter.staticOptions"
              :key="idx"
              class="tw-bg-white hover:tw-bg-slate-50"
            >
              <q-item-section>
                <q-item-label class="tw-font-medium">{{
                  opt.label
                }}</q-item-label>
                <q-item-label caption class="tw-font-mono">{{
                  opt.value
                }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-btn
                  @click="removeStaticOption(idx)"
                  icon="fa-light fa-trash-xmark"
                  color="red-4"
                  flat
                  round
                  dense
                />
              </q-item-section>
            </q-item>
          </q-list>
          <div v-else class="tw-text-center tw-py-8 tw-text-slate-400">
            <q-icon name="fa-light fa-inbox" size="32px" class="tw-mb-2" />
            <p class="tw-text-sm">No options added yet</p>
          </div>
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </q-slide-transition>
</template>

<script setup>
import JsonEditorVue from 'json-editor-vue';
import { useFilterDataSourceController } from '../controllers/filterDataSource.js';

const props = defineProps(['currentFilter', 'newRequestParam', 'newOption']);
defineEmits(['add-request-param', 'add-static-option']);

// ...existing code...
const { optionsSourceModel, removeStaticOption, removeRequestParam } =
  useFilterDataSourceController(props);
</script>
