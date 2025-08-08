<template>
  <template>
    <master-modal 
      v-model="showModal" 
      icon="fa-light fa-file-arrow-down" 
      width="380px" 
      :loading="loading"
      :help="helpText"
      :title="modalTitle" 
      @hide="reset()" 
      @show="init()" 
      custom-position
    >
      <div class="relative-position" v-if="!loading">
        <div class="row q-col-gutter-md">
          <!--Generate new report-->
          <div id="newReportContent" class="col-12" v-if="!customExportData && allowCreation">
            <!--Title-->
            <div class="text-blue-grey tw-mb-3.5 tw-text-base">
              <b>{{ $tr('isite.cms.messages.newReport') }}</b>
            </div>

            <section v-if="isDynamicFilterSummary" class="tw-flex tw-flex-col tw-mb-3.5">
                <span class="text-blue-grey tw-mb-1">
                  <b>Filters</b>
                </span>
                <section>
                  <filterChip :summary="dynamicFilterSummary" />
                </section>
            </section>

            <!--Text help Item-->
            <div class="text-caption q-mb-xs" v-if="exportItem && paramsItem.item"
                 v-html="$tr('isite.cms.messages.newExportItemHelpText', {id: paramsItem.item.id})"></div>
            <!--Text help-->
            <div class="text-caption q-mb-xs" v-else
                 v-html="$tr('isite.cms.messages.newExportHelpText', {pageTitle: pageTitle})"></div>
            <!--Actions-->
            <div class="text-right q-mt-md">
              <!--Extra filter fields-->
              <q-form autocorrect="off" autocomplete="off" ref="formContent" class="row full-width"
                      @submit="newReport()" @validation-error="$alert.error($tr('isite.cms.message.formInvalid'))">
                <!--Fields-->
                <dynamic-field v-for="(field, keyField) in filterFields" :key="keyField"
                               :field="field" class="col-12" v-model="filters[keyField]" />
                <!--Submit-->
                <div class="text-right col-12">
                  <q-btn :label="$tr('isite.cms.label.create')" color="green" rounded unelevated size="13px"
                         padding="xs sm" type="submit" :disable="reportQueue ? true : false" />
                </div>
              </q-form>
            </div>
          </div>
          <!--Last Report information-->
          <div id="lastReportContent" v-if="fileExport.length" class="q-mb-md col-12">
            <template v-for="(file, keyFile) in fileExport" :key="keyFile">
              <div v-if="file.path">
                <q-separator class="q-my-md" />
                <!--Title-->
                <div class="text-blue-grey q-mb-sm">
                  <b>{{ file.fileFormat ? ` (${file.fileFormat})` : '' }}</b>
                  <span v-if="file.fileName"> - {{ file.fileName }}</span>
                </div>
                <!--Date-->
                <div class="text-caption">
                  <label class="text-blue-grey">{{ $tr('isite.cms.label.date') }}:</label>
                  {{ $trd(file.lastModified, { type: 'long' }) }}
                </div>
                <!--Size-->
                <div class="text-caption">
                  <label class="text-blue-grey">{{ $tr('isite.cms.label.size') }}:</label>
                  {{ $helper.formatBytes(file.size) }}
                </div>
                <!--Action-->
                <div class="text-right q-mt-md">
                  <q-btn :label="$tr('isite.cms.label.download')" color="green" rounded unelevated size="13px"
                         padding="xs sm" @click="$helper.downloadFromURL(file.path)" />
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </master-modal>
  </template>
</template>
<script>
import { eventBus, helper } from 'src/plugins/utils';
import filterChip from './dynamicFilter/components/filterChip.vue';

export default {
  beforeUnmount() {
    eventBus.off('export.data.refresh');
    eventBus.off('isite.export.ready');
  },
  props: {
    exportItem: { type: Boolean, default: false },
    dynamicFilterValues: {},
    dynamicFilterSummary: {},
  },
  components: {
    filterChip
  },
  watch: {
    '$route.name': {
      deep: true,
      handler: function(newValue) {
        this.init();
      }
    },
    'offline': {
      deep: true,
      handler: function(newValue) {
        if (!newValue) {
          this.init();
        }
      }
    }
  },
  mounted() {
    this.$nextTick(async function() {
      this.token = await helper.getToken()
      this.init();
    });
    eventBus.on('export.data.refresh', () => this.getData());
  },
  data() {
    return {
      loading: false,
      params: false,
      paramsItem: {},
      customExportData: false,
      showModal: false,
      fileExport: [],
      filters: {},
      token: '',
    };
  },
  computed: {
    offline() {
      return this.$store.state.qofflineMaster.isAppOffline;
    },
    //Page title
    pageTitle() {
      return this.$tr(this.$route.meta.title);
    },
    //Modal export title
    modalTitle() {
      //Default response
      let response = `${this.$tr('isite.cms.label.export')} | `;
      //Extra titel
      if (this.exportItem)
        response += `${this.$tr('isite.cms.label.record')} ID: ${this.paramsItem.item ? this.paramsItem.item.id : ''}`;
      else
        response += this.pageTitle;
      //Response
      return response;
    },
    //filter fields
    filterFields() {
      //Instance default filter fields
      var fields = (this.params.exportFields || {});

      //Add format fields
      if (this.params.formats && Array.isArray(this.params.formats)) {
        fields.fileFormat = {
          value: this.params.formats[0],
          type: 'select',
          props: {
            label: this.$tr('isite.cms.label.format'),
            readonly: this.params.formats.length >= 2 ? false : true,
            options: this.params.formats.map(format => {
              return { label: format, value: format };
            })
          }
        };
      }

      //Add warning reportQueue
      if (this.reportQueue) {
        fields.reportQueue = {
          type: 'banner',
          props: {
            message: this.$tr('isite.cms.reportQueue', {
              date: this.$trd(this.reportQueue, { type: 'long' })
            }),
            color: 'warning'
          }
        };
      }

      //Response
      return fields;
    },
    //Allow Downloads from custom config
    allowCreation() {
      return this.params.allowCreation !== undefined ? this.params.allowCreation : true;
    },
    //Validate if already there is exporting a report
    reportQueue() {
      let lockReport = this.fileExport.find(item => item.reportQueue);
      return lockReport?.reportQueue || null;
    },
    isDynamicFilterSummary() {
      return Object.keys(this.dynamicFilterSummary).length > 0;
    },
    helpText() {
      return {
        title: 'Export',
        description: `
          Need help? See the documentation for more information on Export.
          ${helper.documentationLink(`/docs/agione/export`, this.token)}
        `,
      }
    }
  },
  methods: {
    init() {
      //if (this.$hasAccess('isite.export.manage')) {
      //Get data
      this.getData();
      //Listen event to push new messages
      eventBus.on('isite.export.ready', (response) => {
        this.$alert.info({
          message: this.$tr('isite.cms.messages.exportReady', { fileName: response.data.fileName }),
          timeOut: 12000,
          actions: [
            {
              label: this.$tr('isite.cms.label.showMore'),
              icon: 'fas fa-file-download',
              color: 'white',
              handler: () => {
                this.showReport(response.data);
              }
            }
          ]
        });
      });
      //}
    },
    //Get data
    async getData() {
      this.loading = true;
      await this.getExportConfig();//get export config
      await this.getExportData();//Get export data
      this.loading = false;
    },
    //Get export config
    getExportConfig() {
      return new Promise((resolve, reject) => {
        this.params = false;//Reset params
        let routeParams = this.$helper.getInfoFromPermission(this.$route.meta.permission);
        if (!routeParams) return resolve(false);

        //Request Params
        let requestParams = {
          refresh: true,
          params: {
            filter: {
              configName: `${routeParams.module}.config.exportable.${routeParams.entity}${this.exportItem ? 'Item' : ''}`
            }
          }
        };

        //Request
        this.$crud.index('apiRoutes.qsite.configs', requestParams).then(response => {
          this.params = this.$clone(response.data);
          this.$emit('update:modelValue', this.$clone(response.data));
          resolve(response.data);
        }).catch(error => {
          resolve(false);
        });
      });
    },
    //Get data
    getExportData() {
      return new Promise(async (resolve, reject) => {
        if (!this.params) return resolve(false);
        this.loading = true;
        const filter = this.dynamicFilterValues;
        //Request params
        let requestParams = {
          refresh: true,
          params: {
            exportParams: this.exportItem ? { ...this.params, ...(this.paramsItem.exportParams || {}) } : this.params,
            filter: this.exportItem ? (this.paramsItem.filter || {}) : (filter ? filter : {})
          }
        };

        //Request
        this.$crud.index('apiRoutes.qsite.export', requestParams).then(response => {
          this.fileExport = Array.isArray(response.data) ? response.data : [response.data];
          resolve(response.data);
        }).catch(error => {
          resolve(error);
        });
      });
    },
    buildFileNameWithFilters(fileName) {
      if (
        !this.dynamicFilterSummary || 
        (Object.keys(this.dynamicFilterSummary).length === 0)
      ) return fileName

      const filters = Object.values(this.dynamicFilterSummary)
        .filter(item => item.label && item.option)
        .map(item => `${item.label}=${item.option}`)
        .join(', ')

      return `${fileName}${filters ? ` (${filters})` : ''}`;
    },  
    //Request new report
    newReport() {
      return new Promise(async (resolve, reject) => {
        this.loading = true;
        //Instance de apiRoute
        const apiRoute = this.params.apiRoute || 'apiRoutes.qsite.export';
        const filter = this.dynamicFilterValues;
        //Request params
        let requestParams = {
          exportParams: {
            ...(this.exportItem ? { ...this.params, ...(this.paramsItem.exportParams || {}) } : this.params),
            fileFormat: this.filters.fileFormat,
            fileName: this.buildFileNameWithFilters(this.params.fileName)
          },
          filter: {
            ...(this.exportItem ? (this.paramsItem.filter || {}) : (filter ? filter : {})),
            ...this.filters
          }
        };

        //Request
        this.$crud.post(apiRoute, requestParams).then(response => {
          this.$alert.info(this.$tr('isite.cms.messages.reportInProgress', { fileName: this.params.fileName }));
          this.showModal = false;
        }).catch(error => {
          this.loading = false;
        });
      });
    },
    //Show report
    showReport(customExportData) {
      this.customExportData = this.$clone(customExportData);
      this.showModal = true;
    },
    //Show report Item
    showReportItem(params) {
      this.paramsItem = params;
      this.showModal = true;
    },
    //Reset
    reset() {
      this.loading = false;
      this.customExportData = false;
      this.fileExport = [];
      this.filters = {};
    },
    async getCurrentFilterDate(lastStart, lastEnd) {
      try {
        let lastStartM = this.$moment(lastStart)
          .startOf('day')
          .format('YYYY-MM-DD HH:mm:ss');
        let lastEndM = this.$moment(lastEnd)
          .endOf('day')
          .format('YYYY-MM-DD HH:mm:ss');
        return {
          date: {
            field: 'inbound_scheduled_arrival',
            type: 'custom',
            from: lastStartM,
            to: lastEndM
          }
        };
      } catch (error) {
        console.log(error);
      }
    }
  }
};
</script>
<style lang="scss">
</style>
