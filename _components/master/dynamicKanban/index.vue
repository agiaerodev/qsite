<template>
  <div>
    <infomation
      v-show="!loading"
      ref="modalInfortion"
      @kanbanRefresh="kanbanRefresh"
    />
    <crud
      v-show="!loading"
      :crudData="crudData"
      :custom-data="customData"
      :title="title"
      ref="crudRequests"
    />
    <inner-loading :visible="loading"/>
  </div>
</template>
<script>
//Components

//import infomation from 'modules/qrequestable/_components/modals/information/components/index.vue'
import infomation from 'modules/qsite/_components/master/dynamicKanban/_components/modals/information/components/index.vue'
export default {
  components: { infomation },
  props: {
    crudData: {
      type: Object,
      required: true,
    },
    title: {
      type: String,
      required: false,
      default: '',
    },
  },
  data() {
    return {
      loading: false,
      showAsKanban: true
    };
  },
  provide() {
    return {
      saveForm: this.saveForm,
    };
  },
  computed: {
    isMobile() {
      return window.innerWidth <= 768;
    },
    deletePermissions() {
      return this.$hasAccess('requestable.requestables.destroy');
    },
    customData() {
      return {
        extraActions: [
          {
            label: this.showAsKanban ? 'Table view' : 'Kanban view',
            vIf: !this.isMobile,
            props: {
              icon: this.showAsKanban ? 'fa-light fa-table' : 'fa-light fa-chart-kanban',
              id: 'switch-button-crud'
          },
            action: () => this.switchMode()
          }
        ],
        read: {
          showAs: this.showAsKanban && !this.isMobile ? 'kanban' : 'table',
          actions: [
            {
              name: "viewEntity",
              icon: "fa-light fa-eye",
              label: this.$tr("isite.cms.label.show"),
              format: (field) => {
                return field.requestableUrl ? {} : { vIf: false };
              },
              action: (item) => {
                if (item.requestableUrl)
                  this.$helper.openExternalURL(item.requestableUrl);
              },
            },
            {
              name: "viewLead",
              icon: "fa-light fa-info-circle",
              color: "info",
              tooltip: this.$tr("isite.cms.label.information"),
              action: (item) => {
                this.showModal(item)
              },
            },
            {
              name: "deleteLead",
              label: this.$tr('isite.cms.label.delete'),
              color: 'red',
              icon: 'fa-light fa-trash-alt',
              format: (field) => {
                return { vIf: this.deletePermissions };
              },
              action: (item, automation) => {
                this.delete(item, automation)
              },
            }
          ],
        },
      };
    },
  },
  methods: {
    //update
    async showModal(requestData) {
      await this.$refs.modalInfortion.showRequestData(requestData);
    },
    //delete
    async delete(item, automation = false) {
      if (this.$refs.crudRequests.$refs.crudIndex.$refs.kanban) {
        this.$refs.crudRequests.$refs.crudIndex.$refs.kanban.deleteKanbanCard(item, automation);
      }
    },
    async kanbanRefresh(statusId) {
      if (this.$refs.crudRequests.$refs.crudIndex.$refs.kanban) {
          this.$refs.crudRequests.$refs.crudIndex.$refs.kanban.addCard(statusId);
      }
    },
    async switchMode(){
      this.loading = true;
      this.showAsKanban = !this.showAsKanban
      this.$refs.crudRequests.$refs.crudIndex.loadComponent().then(() => {
        this.$refs.crudRequests.$refs.crudIndex.init()
        this.$refs.crudRequests.$refs.crudIndex.getDataTable()
        this.loading = false;
      } ) ;
    }
  },
};
</script>
