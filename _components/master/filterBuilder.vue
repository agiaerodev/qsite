<template>
  <div id="filterBuilderGenerator" class="tw-min-h-screen tw-bg-slate-50 tw-p-8 tw-font-sans">
    <div class="tw-max-w-7xl tw-mx-auto">
      <header class="tw-mb-10 tw-flex tw-items-center tw-justify-between">
        <div class="tw-flex tw-items-center tw-gap-4">
          <div class="tw-bg-indigo-600 tw-p-3 tw-rounded-2xl tw-shadow-lg tw-shadow-indigo-200">
            <q-icon name="fa-duotone fa-filter-list" size="24px" class="tw-text-white" />
          </div>
          <div>
            <h1 class="tw-text-2xl tw-font-black tw-text-slate-900 tw-tracking-tight">Filter Engine</h1>
            <p class="tw-text-slate-500 tw-text-sm">Architect your dynamic schema and export JSON configurations.</p>
          </div>
        </div>
      </header>

      <div class="tw-grid tw-grid-cols-1 lg:tw-grid-cols-12 tw-gap-10">
        <div class="lg:tw-col-span-7 tw-space-y-6">
          <q-card flat class="tw-border tw-border-slate-200 tw-rounded-3xl tw-bg-white tw-shadow-sm tw-overflow-hidden">
            <div class="tw-bg-slate-50/80 tw-px-6 tw-py-4 tw-border-b tw-border-slate-100 tw-flex tw-items-center tw-gap-3">
              <q-icon name="fa-light fa-sliders-up" size="16px" class="tw-text-slate-400" />
              <span class="tw-font-bold tw-text-slate-700 tw-uppercase tw-text-xs tw-tracking-widest">Base Configuration</span>
            </div>

            <q-card-section class="tw-p-6 tw-grid tw-grid-cols-1 md:tw-grid-cols-2 tw-gap-5">
              <q-input v-model="currentFilter.key" label="Field ID (Key)" stack-label outlined dense color="indigo" placeholder="e.g. user_status" />
              <q-select v-model="currentFilter.type" :options="fieldTypes" label="Component Type" stack-label outlined dense emit-value map-options color="indigo" />
              <q-input v-model="currentFilter.label" label="Display Label" stack-label outlined dense color="indigo" placeholder="User Status" />
              <q-input v-model="currentFilter.defaultValue" label="Default Value" stack-label outlined dense color="indigo" />
            </q-card-section>

            <q-card-section class="tw-px-6 tw-pb-8">
              <div class="tw-grid tw-grid-cols-2 sm:tw-grid-cols-3 tw-gap-4 tw-p-4 tw-bg-slate-50 tw-rounded-2xl tw-border tw-border-slate-100">
                <div v-for="prop in toggles" :key="prop.model" class="tw-flex tw-flex-col tw-items-center">
                  <span class="tw-text-[10px] tw-uppercase tw-font-bold tw-text-slate-400 tw-mb-2">{{ prop.label }}</span>
                  <q-toggle v-model="currentFilter[prop.model]" color="indigo" dense />
                </div>
                <div v-if="['select', 'treeSelect'].includes(currentFilter.type)" class="tw-flex tw-flex-col tw-items-center">
                  <span class="tw-text-[10px] tw-uppercase tw-font-bold tw-text-slate-400 tw-mb-2">Multiple</span>
                  <q-toggle v-model="currentFilter.multiple" color="indigo" dense />
                </div>
              </div>
            </q-card-section>

            <q-slide-transition>
              <div v-if="['select', 'treeSelect'].includes(currentFilter.type)" class="tw-border-t tw-border-slate-100">
                <div class="tw-px-6 tw-pt-6">
                  <q-tabs v-model="currentFilter.optionsSource" dense class="tw-bg-slate-100 tw-rounded-xl tw-p-1" active-color="indigo" indicator-color="transparent" align="justify" no-caps>
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

                <q-tab-panels v-model="currentFilter.optionsSource" animated class="tw-bg-transparent">
                  <q-tab-panel name="api" class="tw-p-6 tw-space-y-4">
                    <q-input v-model="currentFilter.loadOptions.apiRoute" label="Endpoint URL" outlined dense placeholder="/api/v1/options" prefix="GET" />
                    <div class="tw-grid tw-grid-cols-2 tw-gap-4">
                      <q-input v-model="currentFilter.loadOptions.select.label" label="Label Key" outlined dense placeholder="name" />
                      <q-input v-model="currentFilter.loadOptions.select.id" label="Value Key (ID)" outlined dense placeholder="uuid" />
                    </div>

                    <div class="tw-space-y-2">
                      <div class="tw-text-xs tw-font-bold tw-text-slate-500">Request Parameters</div>
                      <div class="tw-flex tw-gap-2">
                        <q-input v-model="newRequestParam.name" label="Key" dense outlined class="tw-grow" />
                        <q-input v-model="newRequestParam.value" label="Value" dense outlined class="tw-grow" />
                        <q-btn @click="addRequestParam" icon="fa-light fa-plus" color="indigo-7" unelevated class="tw-rounded-lg" />
                      </div>
                      <q-list bordered separator v-if="currentFilter.loadOptions.requestParams.length" class="tw-rounded-xl tw-overflow-hidden">
                        <q-item v-for="(param, pIdx) in currentFilter.loadOptions.requestParams" :key="pIdx" class="tw-bg-white hover:tw-bg-slate-50">
                          <q-item-section>
                            <q-item-label class="tw-font-medium">{{ param.name }}</q-item-label>
                            <q-item-label caption class="tw-font-mono">{{ param.value }}</q-item-label>
                          </q-item-section>
                          <q-item-section side>
                            <q-btn @click="currentFilter.loadOptions.requestParams.splice(pIdx, 1)" icon="fa-light fa-trash-xmark" color="red-4" flat round dense />
                          </q-item-section>
                        </q-item>
                      </q-list>
                    </div>
                  </q-tab-panel>

                  <q-tab-panel name="static" class="tw-p-6">
                    <div class="tw-flex tw-gap-3 tw-mb-4">
                      <q-input v-model="newOption.label" label="Option Label" dense outlined class="tw-grow" />
                      <q-input v-model="newOption.value" label="Value" dense outlined class="tw-grow" />
                      <q-btn @click="addStaticOption" icon="fa-light fa-plus" color="indigo-7" unelevated class="tw-rounded-lg" />
                    </div>
                    <q-list bordered separator class="tw-rounded-xl tw-overflow-hidden">
                      <q-item v-for="(opt, idx) in currentFilter.staticOptions" :key="idx" class="tw-bg-white hover:tw-bg-slate-50">
                        <q-item-section>
                          <q-item-label class="tw-font-medium">{{ opt.label }}</q-item-label>
                          <q-item-label caption class="tw-font-mono">{{ opt.value }}</q-item-label>
                        </q-item-section>
                        <q-item-section side>
                          <q-btn @click="currentFilter.staticOptions.splice(idx, 1)" icon="fa-light fa-trash-xmark" color="red-4" flat round dense />
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-tab-panel>
                </q-tab-panels>
              </div>
            </q-slide-transition>

            <q-card-actions align="between" class="tw-bg-slate-50/50 tw-p-6">
              <q-btn @click="resetForm" label="Discard Draft" flat color="slate-400" no-caps icon="fa-light fa-trash-undo" />
              <q-btn
                @click="addFilter"
                unelevated
                color="indigo-7"
                class="tw-rounded-xl tw-px-6 tw-py-3 shadow-indigo hover:tw-translate-y-[-2px] tw-transition-transform"
                no-caps
              >
                <q-icon :name="editingIndex >= 0 ? 'fa-light fa-pen-to-square' : 'fa-light fa-plus-circle'" start size="18px" />
                <span class="tw-font-bold">{{ editingIndex >= 0 ? 'Update Filter' : 'Save to Stack' }}</span>
              </q-btn>
              <div class="tw-text-xs tw-font-bold tw-text-slate-400 tw-uppercase tw-tracking-widest">
                <q-icon name="fa-light fa-database" class="tw-mr-1" />
                Active Items: {{ filtersList.length }}
              </div>
            </q-card-actions>
          </q-card>

          <div v-if="filtersList.length > 0" class="tw-space-y-3">
            <h3 class="tw-text-xs tw-font-bold tw-text-slate-400 tw-uppercase tw-tracking-widest tw-flex tw-items-center tw-gap-2">
              <q-icon name="fa-light fa-layer-group" />
              Current Stack
            </h3>
            <div v-for="(f, i) in filtersList" :key="i"
                 class="tw-group tw-flex tw-items-center tw-justify-between tw-bg-white tw-p-4 tw-rounded-2xl tw-border tw-border-slate-200 tw-shadow-sm hover:tw-border-indigo-200 tw-transition-all">
              <div class="tw-flex tw-items-center tw-gap-4">
                <div class="tw-w-10 tw-h-10 tw-bg-indigo-50 tw-text-indigo-600 tw-rounded-xl tw-flex tw-items-center tw-justify-center">
                  <q-icon :name="getIconForType(f.type)" size="18px" />
                </div>
                <div>
                  <div class="tw-font-bold tw-text-slate-800">{{ f.key }}</div>
                  <div class="tw-text-xs tw-text-slate-400 tw-font-mono">{{ f.type.toUpperCase() }} • {{ f.label }}</div>
                </div>
              </div>
              <div class="tw-flex tw-gap-2">
                 <q-btn @click="editFilter(i)" icon="fa-light fa-pen" color="indigo-4" flat round dense class="tw-opacity-0 group-hover:tw-opacity-100 tw-transition-opacity" />
                 <q-btn @click="filtersList.splice(i, 1)" icon="fa-light fa-trash-can" color="red-4" flat round dense class="tw-opacity-0 group-hover:tw-opacity-100 tw-transition-opacity" />
              </div>
            </div>
          </div>
        </div>

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
      </div>
    </div>
  </div>
  <
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { copyToClipboard, Notify } from 'quasar'

const emit = defineEmits(['update'])
// --- ESTADO ---
const fieldTypes = [
  { label: 'Text Input', value: 'input' },
  { label: 'Select Dropdown', value: 'select' },
  { label: 'Single Date', value: 'date' },
  { label: 'Date Range', value: 'dateRange' }
]

const toggles = [
  { label: 'Quick Filter', model: 'quickFilter' },
  { label: 'Clearable', model: 'clearable' }
]

const filtersList = ref([])
const newOption = reactive({ label: '', value: '' })
const newRequestParam = reactive({ name: '', value: '' })
const editingIndex = ref(-1)

const getCleanFilter = () => ({
  key: '', type: 'select', label: '', defaultValue: null,
  multiple: false, quickFilter: false, clearable: true,
  optionsSource: 'api',
  loadOptions: { apiRoute: '', select: { label: 'name', id: 'id' }, requestParams: [] },
  staticOptions: []
})

const currentFilter = ref(getCleanFilter())

// --- COMPUTED ---
const generatedJson = computed(() => {
  const output = {}
  filtersList.value.forEach(f => {
    const config = {
      value: f.defaultValue || null,
      type: f.type,
      props: { label: f.label, clearable: f.clearable }
    }

    if (f.quickFilter) config.quickFilter = true
    if (f.multiple) config.props.multiple = true

    if (['select', 'treeSelect'].includes(f.type)) {
      if (f.optionsSource === 'api') {
        const lo = f.loadOptions
        config.loadOptions = {
          apiRoute: lo.apiRoute,
          select: { label: lo.select.label, id: lo.select.id }
        }

        if (lo.requestParams && lo.requestParams.length > 0) {
            const params = {}
            lo.requestParams.forEach(item => {
                // Try to parse numbers or booleans
                if (item.value === 'true') params[item.name] = true
                else if (item.value === 'false') params[item.name] = false
                else if (!isNaN(Number(item.value)) && item.value.trim() !== '') params[item.name] = Number(item.value)
                else params[item.name] = item.value
            })
            config.loadOptions.requestParams = params
        }
      } else if (f.staticOptions.length > 0) {
        config.props.options = f.staticOptions.map(opt => ({
          label: opt.label,
          value: isNaN(opt.value) ? opt.value : Number(opt.value)
        }))
      }
    }
    output[f.key] = config
  })
  return JSON.stringify(output, null, 2)
})

// --- MÉTODOS ---
const getIconForType = (type) => {
  const icons = {
    input: 'fa-light fa-input-text',
    select: 'fa-light fa-list-dropdown',
    date: 'fa-light fa-calendar-day',
    dateRange: 'fa-light fa-calendar-range'
  }
  return icons[type] || 'fa-light fa-cube'
}

const addFilter = () => {
  if (!currentFilter.value.key) {
    Notify.create({ message: 'The ID Key is required', color: 'red-5', icon: 'fa-light fa-triangle-exclamation' })
    return
  }

  const filterCopy = JSON.parse(JSON.stringify(currentFilter.value))

  if (editingIndex.value >= 0) {
      filtersList.value[editingIndex.value] = filterCopy
      Notify.create({ message: 'Filter updated', color: 'green-5', icon: 'fa-light fa-check' })
  } else {
      filtersList.value.push(filterCopy)
  }
  resetForm()
}

const editFilter = (index) => {
  editingIndex.value = index
  currentFilter.value = JSON.parse(JSON.stringify(filtersList.value[index]))
  if (!currentFilter.value.loadOptions.requestParams) {
     currentFilter.value.loadOptions.requestParams = []
  }
}

const resetForm = () => {
  currentFilter.value = getCleanFilter()
  editingIndex.value = -1
}

const addStaticOption = () => {
  if (!newOption.label) return
  currentFilter.value.staticOptions.push({ ...newOption })
  newOption.label = ''; newOption.value = ''
}

const addRequestParam = () => {
  if (!newRequestParam.name) return
  currentFilter.value.loadOptions.requestParams.push({ ...newRequestParam })
  newRequestParam.name = ''
  newRequestParam.value = ''
}

const handleCopy = () => {
  copyToClipboard(generatedJson.value).then(() => {
    Notify.create({ message: 'JSON copied to clipboard', color: 'indigo-8', icon: 'fa-light fa-check-double' })
  })
}

watch(generatedJson, (newVal) => {
  try {
    emit('update', JSON.parse(newVal))
  } catch (e) {
    console.error("Error parsing filters for CRUD", e)
  }
}, { deep: true })
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 6px; }
.custom-scrollbar::-webkit-scrollbar-track { background: #0f172a; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
.shadow-indigo { box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.2); }
pre { margin: 0; tab-size: 2; white-space: pre-wrap; word-wrap: break-word; }
</style>
