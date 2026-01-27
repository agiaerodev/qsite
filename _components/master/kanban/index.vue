<template>
  <div>
    <div>
      <page-actions 
        :extra-actions="tableActions"

        :title="title"
        @refresh="init"
      />
    </div>

    <!-- dynamicList: table mode -->
    <div>
      <dynamicList
        v-if="!iskanbanMode"
        :loadPageActions="false"
        :listConfig="crudData"
      />
    </div>
    
    <!--Kanban-->
    <div
      v-if="iskanbanMode"
      :id="`kanbanCtn${uId}`"
      @mouseover="hoverArrow = true"
      @mouseleave="hoverArrow = false"
    >
      <draggable
        :id="`columnKanban${uId}`"
        :list="kanbanColumns"
        :animation="200"
        group="columns"
        ghost-class="ghostCard"
        drag-class="dragCard"
        filter=".ignoreItem"
        draggable=".notMoveBetweenColumns"
        :disabled="!columnPermissions.drag ||loading || kanbanColumns.length === 0"
        class="tw-p-3 tw-h-auto tw-flex tw-space-x-4 tw-overflow-x-auto"
        @change="reorderColumns"
        :item-key="`columnKanban${uId}`"
      >
        <template #item="{element, index}">
          <div v-if="!loading" :class="{'notMoveBetweenColumns': element.type !== 1}">
            <kanbanColumn
              :crudData="crudData"
              :column-data="element"
              :columnIndex="index"
              :totalColumns="kanbanColumns.length"
              :ref="`kanbanColumn-${element.id}`"
              :columnPermissions="columnPermissions"
              :cardPermissions="cardPermissions"
              @deleteCard="item => deleteKanbanCard(item)"
              class="tw-flex-none tw-space-y-0 "
            />
          </div>
        </template>
        <template #footer>
          <div class="tw-flex tw-space-x-4">
            <template v-if="loading">
              <div
                 v-for="(item, index) in 10"
                 :key="index"
                 class="
                  tw-bg-gray-200
                  tw-animate-pulse
                  tw-w-[250px]
                  tw-h-[700px]
                  tw-shadow-md
                  tw-rounded-md"
              />
            </template>

            <div class="tw-text-center tw-w-full" v-if="!loading && kanbanColumns.length === 0">
              <i class="fa-duotone fa-face-pleading tw-text-9xl colorTextPrimary"></i>
              <p class="tw-text-xl tw-font-semibold tw-py-4">No tiene estados creados en esta categoría</p>
            </div>
            <div
              v-if="!loading && hoverArrow && scrollTotal > 0"
              class="
                tw-absolute
                tw-left-0
                tw-cursor-pointer
                tw-bg-white
                tw-shadow-lg
                tw-rounded-full
                tw-p-1
                tw-z-20
                tw-border
                tw-border-gray-200
                icon-left"
              style="top: 35%"
              @click="scrollLeft"
            >
              <i class="fa-light fa-arrow-left tw-text-4xl tw-text-gray-300"></i>
            </div>
            <div
              v-if="!loading && hoverArrow && kanbanColumns.length !== 0"
              class="
                tw-absolute
                tw-right-0
                tw-cursor-pointer
                tw-bg-white
                tw-shadow-lg
                tw-rounded-full
                tw-p-1
                tw-z-20
                tw-border
                tw-border-gray-200
                icon-right"
              style="top: 35%"
              @click="scrollRight"
            >
              <i class="fa-light fa-arrow-right tw-text-4xl tw-text-gray-300"></i>
            </div>
          </div>
        </template>
      </draggable>
    </div>

    <infomation
      v-show="!loading"
      ref="kanbanModalInformation"
    />
    
    <automationRules
      v-if="false"
      ref="automationRules"
    />
    <formComponent
      ref="formComponent"
      :filterName="crudData.column ? crudData.column.filter.name : null"
    />
    <formRules
      ref="formRules"
      :filterName="crudData.column ? crudData.column.filter.name : null"
    />
    <modalStatus />
    <modalAnalytics />
</div>
    
    
</template>

<script>
import kanbanColumn from 'modules/qsite/_components/master/kanban/kanbanColumn.vue';
import automationRules from './automationRules/index.vue';
import draggable from 'vuedraggable';
import formComponent from './modals/form.vue';
import formRules from './modals/formRules';
import modalStatus from './modals//statusModal/index.vue';
import modalAnalytics from './modals/analytics/index.vue';
import showaAnalytics from './modals/analytics/actions/show.ts';
import storeAnalytics from './modals/analytics/store/index.ts';
import infomation from './_components/modals/information/components/index.vue'
import dynamicList from 'modules/qsite/_components/master/dynamicList';

/* tests */
import testColumns from './test/columns'
import testCards from './test/cards'

const modelPayload = {
  id: null,
  title: null,
  color: null,
  value: 1
};
const modelColumn = {
  id: null,
  title: null,
  color: null,
  data: [],
  loading: false,
  page: 1,
  total: 0,
  new: true
};
export default {
  props: {
    crudData: {
      type: Object,
      default: () => ({})
    },
    heightColumn: {
      type: Number,
      default: () => 235
    },
    showFunnel: {
      type: Boolean,
      default: () => false
    },
    automation: {
      type: Boolean,
      default: () => false
    },
    filter: {
      type: Object,
      default: () => ({})
    }
  },
  provide() {
    return {
      saveStatusOrdering: this.saveStatusOrdering,
      addKanbanCard: this.addKanbanCard,
      deleteColumn: this.deleteColumn,
      saveColumn: this.saveColumn,
      updateColumn: this.updateColumn,
      setPayloadStatus: this.setPayloadStatus,
      addColumn: this.addColumn,
      heightColumn: this.heightColumn,
      uId: this.uId,
      init: this.init,      
      
      automation: this.automation,
      openFormComponentModal: this.openFormComponentModal,
      addCard: this.addCard,
      countTotalRecords: this.countTotalRecords,
      deleteKanbanCard: this.deleteKanbanCard,
      updateCardColumn: this.updateCard,
      getStatus: this.getStatus, 
      runShowModal: this.showModal,
    };
  },
  
  components: {
    kanbanColumn,
    draggable,
    automationRules,
    formComponent,
    formRules,
    modalStatus,
    modalAnalytics, 
    infomation, 
    dynamicList
  },
  data() {
    return {
      kanbanColumns: [],
      funnelList: [],
      funnelSelected: null,
      loading: false,
      payloadStatus: { ...modelPayload },
      uId: this.$uid(),
      search: null,
      hoverArrow: false,
      scrollTotal: 0, 
      loadInformatioModal: false, 
      localShowAs: 'kanban'
    };
  },
  mounted() {
    this.$nextTick(async function() {
      await this.init();      
        const elementColumnKanban = document.getElementById(`columnKanban${this.uId}`);
        if (elementColumnKanban) {
          elementColumnKanban.addEventListener('scroll', evt =>
            this.scrollTotal = evt.target.scrollLeft
          );
        }
      //}
    });
  },
  computed: {

    title(){
      return this?.crudData?.title || 'Kanban Component'
    },     
    //Validate read show as
    readShowAs() {
      return this.crudData?.read?.showAs || 'kanban';
    },
    iskanbanMode(){
      return this.localShowAs == 'kanban'

    },

    kanban(){
      return this.crudData?.read?.kanban || null;
    },

    kanbanPermissions(){
      return this.kanban?.permissions || null
    },
    cardPermissions() {
      const permissions = this.kanbanPermissions?.card || null
      return {
        index: permissions?.index || false,
        create: permissions?.create || false,
        edit: permissions?.edit || false,
        delete: permissions?.delete || false, 
        drag: permissions?.drag || false, 
      }
    },
    columnPermissions() {
      const permissions = this.kanbanPermissions?.column || null
      return {
        index: permissions?.index || false,
        create: permissions?.create || false,
        edit: permissions?.edit || false,
        delete: permissions?.delete || false,
        drag: permissions?.drag || false,
      }
    },

    //Table actions
    tableActions() {
      //Default response
      let response = [];
      //adds kanban actions 
      if(this.readShowAs == 'kanban' ){
        response.push({
          label: this.iskanbanMode ? 'Table view' : 'Kanban view',
          //vIf: !this.isMobile,
          props: {
            icon: this.iskanbanMode ? 'fa-light fa-table' : 'fa-light fa-chart-kanban',
            id: 'switchKanbanButton'
          },
          action: () => {
            if(this.readShowAs == 'kanban'){
              this.localShowAs = this.localShowAs === 'kanban' ? 'table' : 'kanban';
              this.init()
            }
            
          }
        })
      }

      /*
      //Add search action
      if (this.crudData.read.search !== false) response.push('search');
      //Add create action
      if (this.crudData.create) {
        if (this.crudData.create?.actions?.length > 0) {
          response.push(
            {
              props: {
                label: this.$tr(`isite.cms.label.new`),
                icon: 'fa-duotone fa-plus',
              },
              type: 'btn-dropdown',
              items: this.crudData.create?.actions || [],
            })
        } else {
          response.push('new')
        }
      }
      // se oculta page action
      if (this.localShowAs === 'kanban') response = [...response, ...this.$refs.kanban.extraPageActions];
      // extras for page action
      if (this.crudData?.extraActions?.length > 0) response.push(...this.crudData.extraActions);
      */
      //Response
      return response.filter((item) => !item.vIfAction);
    },
    help() {
      return this.crudData.read?.help ?? {};
    },
    

    extraPageActions() {
      return [
        {
          vIf: this.$hasAccess('requestable.automationrules.manage'),
          label: this.$tr('requestable.cms.label.analytics'),
          props: {
            padding: '3px 15px',
            icon: 'fa-duotone fa-chart-mixed'
          },
          action: this.openAnalytics
        },
        {
          vIf: this.$hasAccess('requestable.automationrules.manage'),
          label: this.$tr('requestable.cms.label.automationRules'),
          props: {
            icon: 'fa-duotone fa-ruler',
            padding: '3px 15px'
          },
          action: this.openAutomationRulesModal
        },
        {
          vIf: this.$hasAccess('requestable.statuses.manage'),
          label: this.$tr('isite.cms.form.status'),
          props: {
            icon: 'fa-duotone fa-swap-arrows',
            padding: '3px 15px'
          },
          action: () => {
            //kanbanStore().setModalStatus(true);
          }
        }];
    },  
    
    
    scroll() {
      return document.getElementById(`columnKanban${this.uId}`);
    }
  },
  methods: {
    async init(refresh = false, isModal = false) {
      this.kanbanColumns = [];      
      await this.getColumns(refresh, isModal);
    },
    setResetPage() {
      this.kanbanColumns.forEach((item) => {
        item.page = 1;
      });
    },
    async reorderColumns() {
      this.reorder('kanbanColumns');
      await this.saveStatusOrdering();
    },
    reorder(type) {
      this[type].forEach((item, index) => {
        item.position = index;
      });
    },
    async getStatus(refresh = false) {
      
      
      //const response = await this.$crud.index(route.apiRoute, parameters);
      const response = testColumns.list()
      return response;
    },
    async getColumns(refresh = false, isModal = false) {
      try {
        
        this.loading = true;
        const response = await this.getStatus(isModal ? !refresh : refresh);
        //Set the initial data for kanbanColumns
        this.kanbanColumns = response.data.map((item, index) => {
          return {
            id: item.id,
            title: item.title,
            color: item.color,
            data: [],
            page: 1,
            total: 0,
            loading: true,
            new: false,
            position: index,
            type: item.type
          };
        });
        await this.getKanbanColumns(response.data, refresh);
        

      } catch (error) {
        this.loading = false;
        this.kanbanColumns = [];
        console.log(error);
      }
    },
    async getKanbanColumns(data, refresh = false) {
      Promise.all(this.kanbanColumns.map(column => {
        this.loading = false
        return new Promise(resolve => {
          this.getKanbanCard(column, 1, refresh).then(response => {
            column.data = response.data;
            column.total = response.total;
            column.loading = false;
          });
        });
      }));
    },
    async addCard(columnId) {
      const column = this.kanbanColumns.find(item => item.id === columnId);
      if (column) {
        column.loading = true;
        const kanbanCard = await this.getKanbanCard(column, 1, true);
        column.data = kanbanCard.data;
        column.loading = false;
        column.total = kanbanCard.total;
      }
    },
    async getKanbanCard(column, page = 1, refresh = false) {
      try {
        return await this.getKanbanCardList(column, page, refresh);
      } catch (error) {
        column.loading = false;
        console.log(error);
      }
    },
    async getKanbanCardList(column, page, refresh = false) {
      try {
        const response = testCards.findByStatusId(column.id, page);
        return {
          total: response.meta.page.total,
          data: response.data        
        };
      } catch (error) {
        column.loading = false;
        console.log(error);
      }
    },
    getCardList(response) {
      
    },
    async addKanbanCard(column, page) {
      const kanbancolumn = this.kanbanColumns.find(
        (item) => item.id === column.id
      );
      if (kanbancolumn) {
        const kanbanCard = await this.getKanbanCardList(column, page);
        if (kanbanCard.data.length > 0) {
          kanbancolumn.data.push(...kanbanCard.data);
        }
      }
    },
    async deleteKanbanCard(item) {
      try {
        this.$alert.error({
          mode: 'modal',
          title: `ID: ${item.id}`,
          message: this.$tr('isite.cms.message.deleteRecord'),
          actions: [
            { label: this.$tr('isite.cms.label.cancel'), color: 'grey' },
            {
              label: this.$tr('isite.cms.label.delete'),
              color: 'red',
              handler: async () => {
                const column = this.kanbanColumns.find(column => column.id === item.statusId);
                if (column) column.loading = true;
                await this.$crud.delete(route.apiRoute, item.id);
                const kanbanCard = await this.getKanbanCard(this.automation ? column : item.status, 1, true);
                if (column) {
                  column.data = kanbanCard.data || [];
                  setTimeout(() => {
                    column.loading = false;
                  }, 1000);
                  column.total = kanbanCard.total || 0;
                }

              }
            }
          ]
        });
      } catch (error) {
        console.log(error);
      }
    },
    async saveStatusOrdering() {
      try {
        if (!this.kanban.orderStatus) return;
        const route = this.kanban.orderStatus;
        const statusId = this.kanbanColumns.map((item) => ({ id: item.id }));
        await this.$crud.create(route.apiRoute, {
          [route.filter.name]: statusId
        });
      } catch (error) {
        console.log(error);
      }
    },
    addColumn(index, data = null) {
      try {
        const randHexId = Math.floor(Math.random() * 0xFFF)
                          .toString(16)
                          .padStart(3, "0")
                          .toUpperCase(); 
                                                    
        const counter = `kanban-${randHexId}`;
        const randomColor = Math.floor(Math.random() * 16777215).toString(16);
        const column = { ...modelColumn };
        column.id = counter;
        column.color = `#${randomColor}`;
        column.type = data?.type || 0;
        this.kanbanColumns.splice(index + 1, 0, column);
      } catch (error) {
        console.log(error);
      }
    },
    async deleteColumn(columnId) {
      try {
        if (!this.kanban.column) return;
        const route = this.kanban.column;
        const kanbanColumn = this.kanbanColumns.filter(
          (item) => item.id !== columnId
        );
        this.kanbanColumns = kanbanColumn;
        if (!isNaN(columnId)) {
          await this.$crud.delete(route.apiRoute, columnId);
        }
      } catch (error) {
        console.log(error);
      }
    },
    async saveColumn(data) {
      try {
        if (!this.kanban.column) return;
        const route = this.kanban.column;
        const payloadStatus = {};
        payloadStatus.title = data.title;
        payloadStatus.color = data.color;
        payloadStatus[route.filter.name] = this.funnelSelected;
        payloadStatus.type = data.type;
        return await this.$crud.create(route.apiRoute, payloadStatus);
      } catch (error) {
        console.log(error);
        this.setPayloadStatus();
      }
    },
    async updateColumn(data) {
      try {
        if (!this.kanban.column) return;
        const route = this.kanban.column;
        const payloadStatus = {};
        payloadStatus.id = data.id;
        payloadStatus.title = data.title;
        payloadStatus.color = data.color;
        payloadStatus[route.filter.name] = this.funnelSelected;
        await this.$crud.update(route.apiRoute, data.id, payloadStatus);
      } catch (error) {
        console.log(error);
        this.setPayloadStatus();
      }
    },
    setPayloadStatus() {
      this.payloadStatus = {
        id: null,
        title: null,
        color: null,
        value: 1,
        [this.kanban.column.filter.name]: null
      };
    },
    openAutomationRulesModal() {
      if (this.$refs.automationRules) this.$refs.automationRules.openModal();
    },
    async openAnalytics() {
      storeAnalytics.showModal = true;
      storeAnalytics.categoryId = this.funnelSelected;
      await showaAnalytics();
    },
    openFormComponentModal(statusId, title, id = null) {
      if (this.automation) {
        if (this.$refs.formRules) this.$refs.formRules.openModal(statusId, title, id);
      } else {
        if (this.$refs.formComponent) this.$refs.formComponent.openModal(statusId, title);
      }
    },
    countTotalRecords() {
      try {
        this.kanbanColumns.forEach(item => {
          item.total = item.data.length;
        });
      } catch (error) {
        console.log(error);
      }
    },
    
    setSearch(value) {
      this.search = value && value !== '' ? value : null;
    },
    scrollLeft() {
      const content = this.scroll;
      content.scrollLeft -= 400;
      this.scrollTotal = content.scrollLeft;
    },
    scrollRight() {
      const content = this.scroll;
      content.scrollLeft += 400;
      this.scrollTotal = content.scrollLeft;
    },
    updateCard(columId) {
      this.kanbanColumns.forEach(item => {
        if (item.id == columId) {
          item.data.forEach(card => {
            card.statusId = columId;
          });
        }
      });
    },
    async showModal(requestData) {
      if(!this.loadInformatioModal){
        this.loadInformatioModal = true;
        await this.$refs.kanbanModalInformation.showRequestData(requestData).then(() => {
          this.loadInformatioModal = false;
        });        
      }      
    },
  }
};
</script>

<style lang="scss">


.kanbanBtnCtn .q-btn {
  border-radius: 10px;
}

.colorTextPrimary {
  color: $primary;
}

.icon-right {
  animation-name: slideUpReturn;
  animation-duration: .5s;
  animation-fill-mode: both;
  margin-top: 2px;
}

.icon-left {
  animation-name: slideLeftReturn;
  animation-duration: .5s;
  animation-fill-mode: both;
  margin-top: 2px;
}

@keyframes slideUpReturn {
  0% {
    transform-origin: 0 0;
    transform: translateX(100%);
  }
  100% {
    transform-origin: 0 0;
    transform: translateX(0%);
  }
}

@keyframes slideLeftReturn {
  0% {
    transform-origin: 0 0;
    transform: translateX(0%);
  }
  100% {
    transform-origin: 0 0;
    transform: translateX(25%);
  }
}
</style>
