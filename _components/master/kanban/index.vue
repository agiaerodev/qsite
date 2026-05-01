<template>
  <div>
    <div>
      <page-actions
        :extra-actions="tableActions"
        :excludeActions="excludeActions"
        :searchAction="crudData.read?.searchAction"
        :title="title"
        @search="val => setSearch(val)"
        @new="openModal({col: null, row: {}, isCreate: true})"
        @refresh="init"
        ref="pageActionRef"
        :tour-name="tourName"
        :help="help"
        :expires-in="expiresIn"
        @activateTour="$tour.start(tourName)"
        :systemName="systemName"
        :dynamicFilter="dynamicFilter"
        :speech="crudData.read?.speech"
        @updateDynamicFilterValues="filters => updateDynamicFilterValues(filters)"
      />
    </div>

    <!-- dynamicList: table mode -->
    <div>
      <dynamicList
        v-if="!iskanbanMode"
        ref="dynamicListRef"
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
        v-if="!loading"
        :id="`columnKanban${uId}`"
        :list="kanbanColumns"
        :animation="200"
        group="columns"
        ghost-class="ghostCard"
        drag-class="dragCard"
        filter=".ignoreItem"
        draggable=".notMoveBetweenColumns"
        :disabled="disabledColumn"
        class="tw-p-3 tw-h-auto tw-flex tw-space-x-2 tw-overflow-x-auto"
        @change="reorderColumns"
        :item-key="`columnKanban${uId}`"
      >
        <template #item="{element, index}">          
          <div v-if="!loading" class="notMoveBetweenColumns">
            <kanbanColumn
              :cardComponent="cardComponent"
              :uId="uId"
              :crudData="crudData"
              :column-data="element"
              :columnIndex="index"
              :kanbanColumns="kanbanColumns"
              :totalColumns="kanbanColumns.length"
              :ref="`kanbanColumn-${element.id}`"
              :columnPermissions="columnPermissions"
              :cardPermissions="cardPermissions"
              @countTotalRecords="countTotalRecords()"
              @addColumn="addColumn"
              @reloadColumn="({column, page}) => reloadColumn(column, page)"
              @openModal="(value) => openModal(value)"
              @deleteColumn="value => deleteColumn(value)"
              @deleteCard="item => deleteKanbanCard(item)"
              @updateCardColumn="column => updateCardColumn(column)"
              @reorderColumns="reorderColumns"
              @columnEvents="value => columnEventshandler(value)"
              @revertCard="revertCard"
              class="tw-flex-none tw-space-y-0 "
            >
            <template #header>
              <component 
                ref="columnHeaderComponent"
                v-if="columnHeaderComponent"
                :is="columnHeaderComponent"
                :col="element"
                :dynamicFilterValues="dynamicFilterValues"
                @openModal="(value) => openModal(value)"
              >
              </component>
            </template>
            </kanbanColumn>
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
      <div 
        v-if="loading"
        class="tw-w-full tw-align-middle tw-justify-center tw-relative"
      >
        <!--Loading-->
        <inner-loading :visible="loading"/>

      </div>
    </div>

    <component
      ref="modalComponentRef"
      v-if="modalComponent"
      :is="modalComponent"
      :stateModal="stateModal"
      @cancel="closeModal()"
      @close="closeModal()"
      @createCard="value => createCard(value)"
      @reloadColumn="value => reloadColumn(value)"
      @reloadCard="value => reloadCard(value)"
      @openModal="(value) => openModal(value)"
      @revertCard="revertCard"
    />
</div>


</template>

<script>
import { markRaw } from "vue";
import kanbanColumn from 'modules/qsite/_components/master/kanban/kanbanColumn.vue';
import draggable from 'vuedraggable';
import dynamicList from 'modules/qsite/_components/master/dynamicList';
import superModal from 'modules/qsite/_components/master/kanban/_components/modals/superModal'
/* tests */
import testColumns from './test/columns'
import testCards from './test/cards'
import services from "modules/qsite/_components/master/kanban/services";
import columns from "./test/columns";

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
  },
  provide() {
    return {};
  },

  components: {
    kanbanColumn,
    draggable,
    dynamicList,
    superModal
  },
  data() {
    return {
      kanbanColumns: [],
      funnelList: [],
      funnelSelected: null,
      loading: false,
      payloadStatus: { ...modelPayload },
      uId: this.$uid(),

      hoverArrow: false,
      scrollTotal: 0,
      loadInformatioModal: false,
      localShowAs: 'kanban',
      expiresIn: null,
      tourName: 'admin_crud_index_tour',
      dynamicFilterValues: {},

      cardComponent: null,
      modalComponent: null,
      columnHeaderComponent: null,

      stateModal: {
        show: false,
        isCreate: true,
        col: {},
        row: {},
      }
    };
  },
  mounted() {
    this.$nextTick(async function() {
      //await this.init();
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
      return this?.crudData?.title || ''
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
    disabledColumn(){
      return !this.columnPermissions.drag || this.loading || this.kanbanColumns.length === 0
    },

    //Table actions
    tableActions() {
      //Default response
      let response = [];
      //adds kanban actions
      if(this.readShowAs == 'kanban' ){
        response.push({
          label: this.iskanbanMode ? 'Table view' : 'Kanban view',
          vIf: false,
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


      //Add search action
      if (this.crudData?.read?.search !== false) response.push('search');
      //Add create action
      if (this.crudData?.create) {
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

      // extras for page action
      if (this.crudData?.extraActions?.length > 0) response.push(...this.crudData.extraActions);

      return response.filter((item) => !item.vIfAction);
    },
    //Exclude actions
    excludeActions() {
      let response = this.crudData.read?.excludeActions || [];
      if (this.crudData?.read?.noFilter) response.push('filter');
      return response;
    },
    help() {
      return this.crudData.read?.help ?? {};
    },
    systemName() {
      return this.crudData.read?.systemName || this.crudData?.permission || this.crudData?.entityName;
    },
    dynamicFilter() {
      if (this.isAppOffline) return false;
      if (this.crudData.read?.filters) {
        if (Object.keys(this.crudData.read?.filters).length > 0) {
          return this.crudData.read?.filters;
        }
      }
      return {};
    },
    isAppOffline() {
      return this.$store.state.qofflineMaster.isAppOffline;
    },

    scroll() {
      return document.getElementById(`columnKanban${this.uId}`);
    }
  },
  methods: {
    async init(refresh = false) {
      this.getCardComponent()
      await this.buildColumns(true);
    },

    getCardComponent(){
      if(!this.kanban) return
      this.cardComponent =  markRaw(this?.kanban?.cardComponent?.content)
      this.modalComponent = markRaw(this?.kanban?.cardComponent?.modal)
      this.columnHeaderComponent = markRaw(this?.kanban?.columnComponent?.header)      
    },


    setResetPage() {
      this.kanbanColumns.forEach((item) => {
        item.page = 1;
      });
    },
    async reorderColumns() {

      this.kanbanColumns.forEach((item, index) => {
        item.position = index;
      });
      await this.saveStatusOrdering();
    },
    reorder(type) {
      this[type].forEach((item, index) => {
        item.position = index;
      });
    },
    async buildColumns(refresh = false) {
      try {
        this.loading = true; 
        this.kanbanColumns = [];       
        const response = await services.getColumns(this.kanban.columns.apiRoute, this.kanban.columns?.requestParams || {}, refresh)
        /* test */
        /*
        const response = testColumns.list()
        */
        //Set the initial data for kanbanColumns
        this.kanbanColumns = response.data.map((item, index) => {
          return {
            ...item,
            id: item.id,
            title: item?.title || item?.name || '--',

            color: item?.color || '#3B82F6',
            data: [],
            page: 1,
            total: 0,
            loading: true,
            new: false,
            position: index,
            //type: item.type
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
          this.getKanbanCardList(column, 1, refresh).then(response => {
            column.data = response.data;
            column.total = response.total;
            column.hasNextPage = response.hasNextPage            
            column.loading = false;
          });
        });
      }));
    },

    async createCard(card){
      let response = null
      if(card?.id){
        response = await services.updateCard(this.kanban.cards.apiRoute, card.id, card)
      } else {
        response = await services.createCard(this.kanban.cards.apiRoute, card)
      }
      if(response?.data){
        this.reloadColumn(response.data.statusId)
      }
      this.closeModal()
    },

    /* reloadCard */
    async reloadCard({ columnId, data, requestParams}) {
      console.log('reloadCar', columnId, data)
      
      this.kanbanColumns.find((column, columnIndex) => {
        if(column.id == columnId){
          console.log('col')
          column.data.find(async (item,index) => {
            if(item.id == data.id){              
              console.log('card')
              this.kanbanColumns[columnIndex].data[index] = {}
              await getReservation(data.id, requestParams, true).then((response) => {
                console.log('response', response)
                this.kanbanColumns[columnIndex].data[index] = response.data
              })             
            }
          })
        }
      })
    },


    /* reload column*/
    async reloadColumn(columnId, page = 1) {
      
      const column = this.kanbanColumns.find(item => item.id == columnId);
      if (column) {        
        const loadingKey = page == 1  ? 'loading' : 'infiniteLoading'
        const kanbanCard = await this.getKanbanCardList(column, page, true, loadingKey);        
        
        if(page == 1){
          column.data = kanbanCard.data;          
        } else {
          column.data.push(...kanbanCard.data)
        }
        column.page = page
        column.hasNextPage = kanbanCard.hasNextPage
        column.total = kanbanCard.total;
      }
    },
    
    async getKanbanCardList(column, page, refresh = false, loadingKey = 'loading') {
      try {
        const search = this.search ? { search: this.search } : {};
        let params = {
          filter: {
            'statusId': column.id,
            ...search,
            order: { way: 'desc' }
          },
          page: page,
          take: 10,
        };
        if(this.kanban.cards?.requestParams) params = {...params, ...this.kanban.cards?.requestParams}
        if(Object.keys(this.dynamicFilterValues).length) params.filter = {...params.filter, ...this.dynamicFilterValues}
        
        column[loadingKey] = true;
        let response = await services.getCards(this.kanban.cards.apiRoute, params, true)
        /* test  */
        /*
        const response = testCards.findByStatusId(column.id, page);        
        */
        column[loadingKey] = false
        
        const metaPage = response?.meta?.page
        const hasNextPage =  metaPage?.hasNextPage || metaPage['HasNextPage'] || false;

        return {
          total: metaPage?.total || 0,
          hasNextPage,
          data: response?.data || []
        };
      } catch (error) {
        column.loading = false;
        console.log(error);
        return {
          total: 0,
          data: []
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
                await services.deleteCard(this.kanban.cards.apiRoute, item.id).then( async (response) => {
                  await this.reloadColumn(column.id)
                  column.loading = false
                })
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
        const payload = this.kanbanColumns.reduce((obj, item) => {
          obj[item.position] = item.id;
          return obj;
        }, {});
        services.orderColumns(this.kanban?.columns?.orderApiRoute, payload)

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
        if (!this.kanban.columns) return;
        const kanbanColumn = this.kanbanColumns.filter(
          (item) => item.id !== columnId
        );
        this.kanbanColumns = kanbanColumn;
        if (!isNaN(columnId)) {
          await services.deleteColumn(this.kanban.columns.apiRoute, columnId)
        }
      } catch (error) {
        console.log(error);
      }
    },
    async saveColumn(data) {
      try {
        if (!this.kanban.column) return;
        //return await this.$crud.create(route.apiRoute );
      } catch (error) {
        console.log(error);

      }
    },
    async updateColumn(data) {
      try {
        if (!this.kanban.column) return;

        //await this.$crud.update(route.apiRoute, data.id, payloadStatus);
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
      if(this.iskanbanMode){
        this.buildColumns(true);

      } else {
        this.$refs.dynamicListRef.search(val)
      }
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
    updateCardColumn(columId) {
      this.kanbanColumns.forEach(item => {
        if (item.id == columId) {
          item.data.forEach(card => {
            card.statusId = columId;
          });
        }
      });
    },


    openModal({col, row, tab, isCreate = true, event = null}){
      this.stateModal.col = col
      this.stateModal.row = row
      this.stateModal.isCreate = isCreate
      row.loading = true
      this.$refs.modalComponentRef.init(tab, event).then(response => {
        row.loading = false
      }).catch(error => {
        this.$alert.error(`Error Opening card, reservation id: ${row.id}`)
        this.closeModal()
        row.loading = false
      })
      this.stateModal.show = true
    },
    closeModal(){
      this.stateModal.col = {}
      this.stateModal.row = {}
      this.stateModal.show = false
      this.stateModal.isCreate = true
    },

    columnEventshandler({col, row, event}){
      this.openModal({
        col, 
        row,
        tab: null, 
        isCreate: false, 
        event
      })
    },

    //Hanlder method create
    handlerActionCreate() {
      //Redirect to vue route
      if (this.crudData.create.to) return this.$router.push(this.crudData.create.to);
      //Redirect esternal URL
      if (this.crudData.create.toExternalUrl) return this.$helper.openExternalURL(this.crudData.create.toExternalUrl, false);
      //Call a method to dispatch this action
      if (this.crudData.create.method) return this.crudData.create.method();
      //Emit event create
      this.$emit('create');
    },
    updateDynamicFilterValues(filters) {
      this.dynamicFilterValues = filters;
      this.init()
      ///this.table.filter = filters;
      //this.getDataTable(true, filters, { page: 1 });
    },
    revertCard(fromId, toId, row, columnSnapshot){
      
      const fromIndex = this.kanbanColumns.findIndex(item => item.id == fromId)
      const toIndex = this.kanbanColumns.findIndex(item => item.id == toId)

      this.kanbanColumns[fromIndex].data = columnSnapshot
      this.kanbanColumns[toIndex].data = this.kanbanColumns[toIndex].data.filter(item => item.id != row.id)
    }
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
