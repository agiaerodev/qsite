<template>
  <div>
    <div>
      <page-actions
        :extra-actions="tableActions"
        :excludeActions="excludeActions"
        :searchAction="crudData.read?.searchAction"
        :title="title"
        @search="val => search(val)"
        @new="openModal({col: null, data: null})"
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
        :id="`columnKanban${uId}`"
        :list="kanbanColumns"
        :animation="200"
        group="columns"
        ghost-class="ghostCard"
        drag-class="dragCard"
        filter=".ignoreItem"
        draggable=".notMoveBetweenColumns"
        :disabled="disabledColumn"
        class="tw-p-3 tw-h-auto tw-flex tw-space-x-4 tw-overflow-x-auto"
        @change="reorderColumns"
        :item-key="`columnKanban${uId}`"
      >
        <template #item="{element, index}">
          <div v-if="!loading" class="notMoveBetweenColumns">
            <kanbanColumn
              :cardComponent="cardComponent"
              :headerComponent="headerComponent"
              :uId="uId"
              :crudData="crudData"
              :column-data="element"
              :columnIndex="index"
              :totalColumns="kanbanColumns.length"
              :ref="`kanbanColumn-${element.id}`"
              :columnPermissions="columnPermissions"
              :cardPermissions="cardPermissions"
              :countTotalRecords="countTotalRecords()"
              @addColumn="addColumn"
              @addKanbanCard="value => addKanbanCard(value)"
              @addCard="addCard"
              @openModal="(value) => openModal(value)"
              @deleteColumn="value => deleteColumn(value)"
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

  <superModal
    v-model="stateModal.show"
    v-bind="stateModal.modalProps"
  >
    <component
      :is="modalComponent"
      v-bind="{
        data: stateModal.data,
        col: stateModal.col
      }"
      @cancel="() => stateModal.show = false"
      @init="(props) => {
        stateModal.modalProps = props
      }"
      @createCard="value => createCard(value)"

    />
  </superModal>

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
      headerComponent: null,
      modalComponent: null,

      stateModal: {
        modalProps: {
          'custom-position': true,
          'modalWidthSize': "80%"
        },
        col: null,
        data: null,
        show: false
      }
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
      this.kanbanColumns = [];
      await this.getColumns(true);
    },

    getCardComponent(){
      if(!this.kanban) return
      this.cardComponent =  markRaw(this?.kanban?.cardComponent?.content)
      this.headerComponent = markRaw(this?.kanban?.cardComponent?.header)
      this.modalComponent = markRaw(this?.kanban?.cardComponent?.modal)
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
    async getColumns(refresh = false) {
      try {
        this.loading = true;
        const response = await services.getColumns(this.kanban.columns.apiRoute, this.kanban.columns?.requestParams || {}, refresh)
        //Set the initial data for kanbanColumns
        this.kanbanColumns = response.data.map((item, index) => {
          return {
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
          this.getKanbanCard(column, 1, refresh).then(response => {
            column.data = response.data;
            column.total = response.total;
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
        this.addCard(response.data.statusId)
      }
      this.closeModal()
    },

    async addCard(columnId) {
      console
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
        const search = this.search ? { search: this.search } : {};

        const parameters = {
          params :{
            filter: {
              'statusId': column.id,
              ...search,
              order: { way: 'desc' }
            },
          },
          page: page,
          take: 10,
        };

        let response = await services.getCards(this.kanban.cards.apiRoute, parameters, refresh)
        //response = testCards.findByStatusId(column.id, page);

        return {
          total: response.meta.page.total,
          data: response.data
        };
      } catch (error) {
        column.loading = false;
        console.log(error);
      }
    },
    //for in infiniteHandler
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
                await services.deleteCard(this.kanban.cards.apiRoute, item.id).then( async (response) => {
                  await this.addCard(column.id)
                  column.loading = false
                })

                /*
                const kanbanCard = await this.getKanbanCard(this.automation ? column : item.status, 1, true);
                if (column) {
                  column.data = kanbanCard.data || [];
                  setTimeout(() => {
                    column.loading = false;
                  }, 1000);
                  column.total = kanbanCard.total || 0;
                }
                  */

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

        const statusId = this.kanbanColumns.map((item) => ({ id: item.id }));
        console.log('reorder columns')
        /*
        await this.$crud.create(route.apiRoute, {
          [route.filter.name]: statusId
        });
        */
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
        console.log(columnId)
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
        console.log('save colunm')
        //return await this.$crud.create(route.apiRoute );
      } catch (error) {
        console.log(error);

      }
    },
    async updateColumn(data) {
      try {
        if (!this.kanban.column) return;
        console.log('updateColumn')

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


    openModal({col, card }){
      if(card?.modalProps){
        this.stateModal.modalProps = card.modalProps
      }
      this.stateModal.col = col
      this.stateModal.data = card
      this.stateModal.show = true
      //console.log({col, card })
    },
    closeModal(){
      this.stateModal.col = null
      this.stateModal.data = null
      this.stateModal.show = false
    },
    search(val){
      console.log(val)
      if(this.iskanbanMode){
        //kanban search
      } else {
        this.$refs.dynamicListRef.search(val)
      }
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
      ///this.table.filter = filters;
      //this.getDataTable(true, filters, { page: 1 });
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
