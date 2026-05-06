<template>
  <div class="columnCtn tw-relative bg-white no-shadow"
    :class="columnClass"
  >
    <div
      class="tw-h-auto"
      :class="`cardItemsCtn-${this.uId}${columnData.id}`"
      @mouseover="hover = true"
      @mouseleave="hover = false"
    >
      <div
        v-if="columnData.loading && !loading"
        class="
          tw-flex
          tw-justify-center
          tw-absolute
          tw-inset-0
          tw-pt-48
          tw-bg-white
          tw-bg-opacity-75
          tw-z-20
        "
        :class="columnClass"
      >
        <div class="tw-w-full tw-flex tw-justify-center">
          <div>
            <q-spinner color="primary" size="3em" />
          </div>
        </div>
      </div>
      <button
        class="
          tw-absolute
          tw-right-0
          tw-z-20
          tw-mt-2
          tw--mr-2
          tw-bg-white
          tw-rounded-full
          tw-px-1
          tw-text-center
          tw-shadow-lg
          tw-shadow-gray-500/40
          tw-cursor-pointer
          tw-transition
          tw-duration-150
          tw-ease-out
          hover:tw-ease-in
          hover:tw--translate-y-1 icon-plus
        "
        v-if="allowCreateColumn"
        @click="addColumnKanban"
      >
        <i
          class="
            fas
            fa-plus
            tw-text-gray-400
            tw-drop-shadow-lg"
        />
      </button>
      <div
        class="
          tw-flex
          tw-w-full
          tw-py-2
          tw-px-3
          tw-rounded-lg
          arrowKanbanName
        "
        @mouseover="arrowKanbanNameHover = true"
        @mouseleave="arrowKanbanNameHover = false"
        :style="{ background: columnData.color }"
      >
        <div class="arrowKanban" :style="{ background: columnData.color }"></div>
        <div
          class="tw-flex tw-w-full kanbanName"
        >
          <div class="tw-w-10/12">
            <p
              v-if="!columnData.new"
              class="
                tw-mx-1
                tw-text-xs
                tw-whitespace-nowrap
                tw-font-bold
                tw-my-1
                tw-truncate
              "
              :class="{ 'tw-text-white': columnData.color }"
            >
              {{ columnData.title }}
            </p>
            <dynamic-field
              v-else
              :field="inputDynamicField"
              v-model="columnData.title"
              class="tw-pr-3"
              @enter="addColumnName"
            />
          </div>
          <div
            v-if="allowEditColumn"
            class="
              tw-w-1/12
              tw-text-xs
              tw-cursor-pointer
              icon-edit "
            :class="{ 'tw-text-white': columnData.color }"
          >
            <q-btn
              flat
              round
              padding="5px"
              icon="fas fa-pencil-alt"
              size="6px"
              @click="columnData.new = true"
            >
              <q-tooltip> Edita Column </q-tooltip>
            </q-btn>
          </div>
          <div
            v-if="arrowKanbanNameHover && !columnData.new"
            class="tw-w-1/12
              tw-text-xs
              tw-cursor-pointer icon-edit"
            :class="{ 'tw-text-white': columnData.color }"
          >
            <q-btn
              flat
              round
              padding="5px"
              icon="fa-duotone fa-rotate-right"
              size="6px"
              @click="reloadColumn()"
            >
              <q-tooltip>
                  {{ $trp('isite.cms.label.refresh') }}
              </q-tooltip>
            </q-btn>
          </div>
          <div
            v-if="columnData.new"
            class="tw-flex"
            :class="{ 'tw-text-white': columnData.color }"
          >
            <div>
              <q-btn flat round size="6px">
                <template v-slot:default>
                  <q-icon name="fas fa-fill" class="cursor-pointer">
                    <q-popup-proxy
                      transition-show="scale"
                      transition-hide="scale"
                    >
                      <q-color
                        v-model="columnData.color"
                        no-header-tabs
                        class="my-picker"
                      />
                    </q-popup-proxy>
                  </q-icon>
                  <q-tooltip> Asignar Color </q-tooltip>
                </template>
              </q-btn>
            </div>
            <div v-if="columnData.data.length > 0">
              <q-btn
                flat
                round
                padding="5px"
                icon="fa-light fa-check"
                size="6px"
                @click="addColumnName"
              />
            </div>
            <div>
              <q-btn
                v-if="columnData.data.length === 0"
                flat
                round
                icon="fas fa-times"
                size="6px"
                @click="columnDeleteMessages(columnData)"
              >
                <q-tooltip> Delete Column {{ columnData?.title }} </q-tooltip>
              </q-btn>
            </div>
          </div>
        </div>
      </div>
      <!--column header -->
      <div class="tw-py-[10px]" v-if="$slots?.header">
          <div>
            <slot name="header" />
          </div>
      </div>
      <div class="tw-py-[10px]" v-if="cardPermissions.create && !$slots?.header">
        <q-btn
          flat
          class="
            tw-w-full
            hover:tw-text-white
            hover:tw-bg-gray-200"
          @click=" () => openModal()"
          :disabled="allowCreateCard"
          >
          <i class="fa-solid fa-plus"></i>
        </q-btn>
      </div>
      <div
        class="
          c-body
          tw-overflow-y-auto
          tw-overflow-x-hidden
        "
      >
        <draggable
          :id="columnData.id"
          :list="columnData.data"
          :animation="200"
          group="data"
          ghost-class="ghostCard"
          drag-class="dragCard"
          filter=".ignoreItem"
          :style="{ height: computedHeight }"
          :force-fallback="true"
          @start="start()"
          @end="move"
          @change="change"
          @choose="choose()"
          @unchoose="unchoose()"
          item-key="id"
          :disabled="!cardPermissions.drag"
        >
          <template #item="{ element }">
            <kanbanCard
              v-if="!columnData.loading"
              :crudData="crudData"
              :cardData="element"
              :cardPermissions
              :colorColumn="element.color"
              :class="element?.loading ? 'ghostCard': ''"
              class="tw-cursor-pointer tw-mb-4"
              :id="element.id"
              :style="isDragCursor ? 'cursor: grabbing' : 'cursor: pointer'"
              @openModal="tab => openModal(element, false, tab)"
              @deleteCard="$emit('deleteCard', element)"
            >

                <component
                  v-if="cardComponent"
                  :is="cardComponent"
                  v-bind="{data: element}"
                  @openModal="tab => openModal(element, false, tab)"
                  @deleteCard="$emit('deleteCard', element)"
                >
                  <template #kanban-actions>
                    <kanbanActions
                      :crudData="crudData"
                      :cardPermissions="cardPermissions"
                      :cardData="element"
                      @openModal="tab => openModal(element, false, tab)"
                      @deleteCard="$emit('deleteCard', element)"
                    />
                  </template>
                </component>
            </kanbanCard>


          </template>
          <template #footer>
            <div>
              <div class="tw-text-center tw-h-5 tw-rounded">
                <q-banner
                  inline-actions
                  rounded
                  class="primary"
                  v-if="
                    columnData.total !== 0 &&
                    !columnData.hasNextPage &&
                    !columnData.loading
                  "
                >
                  <div class="tw-font-[600]">All reservations loaded</div>
                </q-banner>
              </div>
              <div
                :class="`trigger-${this.uId}${columnData.id}`"
                class="tw-text-center tw-h-5 tw-flex tw-justify-center"
              >
                <div
                  class="
                    tw-w-full
                    tw-h-[60px]
                    tw-flex
                    tw-justify-center
                  "
                >
                  <div
                    v-if="columnData?.infiniteLoading"
                  >
                    <q-spinner  color="primary" size="2em" />
                  </div>
                </div>

              </div>
            </div>
          </template>
        </draggable>
      </div>
    </div>
  </div>
</template>

<script>

import draggable from "vuedraggable";
import kanbanCard from "modules/qsite/_components/master/kanban/kanbanCard.vue";
import kanbanActions from 'modules/qsite/_components/master/kanban/kanbanActions.vue';
import services from 'modules/qsite/_components/master/kanban/services'

export default {
  props: {
    crudData: {
      type: Object,
      required: true,
    },
    columnData: {
      type: Object,
      required: true,
    },
    columnIndex: {
      type: Number,
      required: true,
    },
    kanbanColumns: {
      type: Array,
      default: () => []
    },
    totalColumns: {
      type: Number,
      default: () => 0,
    },
    columnPermissions: {
      type: Object,
      required: true,
    },
    cardPermissions: {
      type: Object,
      required: true,
    },
    uId: {
      type: String,
    },
    cardComponent: {
      type: Object,
    },
    headerComponent: {
      type: Object,
    }

  },
  async beforeMount(){
    ///await this.getCardComponent();
  },
  mounted() {

    const parent = document.querySelector(`#kanbanCtn${this.uId}`);
    this.initialheight = `${window.innerHeight - parent.offsetTop - this.columnHeight}px`;

    window.addEventListener("resize", () => {
      setTimeout(() => {
        this.computedHeight = `${
          window.innerHeight - parent.offsetTop - 100
        }px`;
      }, 100);
    });
    // infinite scroll
    const observerOptions = {
      root: document.querySelector(`.cardItemsCtn-${this.uId}${this.columnData.id}`),
    };
    const target = document.querySelector(`.trigger-${this.uId}${this.columnData.id}`);
    const observer = new IntersectionObserver(
      this.observerCallback,
      observerOptions
    );
    observer.observe(target);
  },
  data() {
    return {
      initialheight: null,
      loading: false,
      hover: false,
      arrowKanbanNameHover: false,
      dragColumn: false,
      dragCursor: false,
      cardActions: [],
      columnSnapshot: null
    };
  },
  components: {
    draggable,
    kanbanCard,
    kanbanActions
  },
  computed: {
    kanban(){
      return this.crudData?.read?.kanban || null;
    },
    isDragCursor() {
      return this.dragCursor;
    },
    allowCreateCard() {
      return typeof this.columnData.id == 'string' || !this.cardPermissions.create;
    },
    allowCreateColumn() {
      if(this.columnPermissions.create) {
        return this.hover;
      }
      return false;
    },
    allowEditColumn() {
      if(this.columnPermissions.edit) {
        return this.arrowKanbanNameHover && !this.columnData.new
      }
      return false;
    },
    inputDynamicField() {
      return {
        value: null,
        type: 'input',
        isFakeField: true,
        props: {},
      }
    },
    computedHeight: {
      get() {
        return this.initialheight;
      },
      set(value) {
        this.initialheight = value;
      },
    },
    isTotalNumberOfRecords() {
      return this.columnData.total === this.columnData.data.length;
    },
    columnClass(){
      return this?.kanban?.columnClass || 'tw-w-[222px]'

    },
    columnHeight(){
      return this?.kanban?.columnHeight || '235'
    },

  },
  methods: {
    getCardComponent(){
      if(!this.kanban) return
      this.cardComponent =  markRaw(this?.kanban?.cardComponent?.content)
      ///this.headerComponent =  markRaw(this?.kanban?.cardComponent?.header)
    },

    addColumnKanban() {
      this.$emit('addColumn', this.columnIndex, this.columnData);
    },
    async columnDeleteMessages(columnData) {
      this.$q.dialog({
          ok: this.$tr('isite.cms.label.delete'),
          message: `Delete column: ${columnData.title} ?`,
          cancel: true,
          persistent: true
        }).onOk(async() => {
          ///await this.deleteColumn(this.columnData.id);
          this.$emit('deleteColumn', this.columnData.id )
          this.$alert.info({ message: this.$tr('isite.cms.message.recordDeleted') });
          this.$emit('saveStatusOrdering')
          //await this.saveStatusOrdering();
        }).onCancel(() => {})
    },
    observerCallback(entries) {
      entries.forEach(({ isIntersecting }) => {
        if (isIntersecting) {
          this.infiniteHandler();
        }
      });
    },
    reloadColumn(){
      if (!this.columnData.loading) {
        this.$emit('reloadColumn', {
          column: this.columnData.id,
          page: 1
        })
      }
    },
    async infiniteHandler() {
      try {
        if (this.columnData.hasNextPage) {
          const page = this.columnData.page + 1;
          this.$emit('reloadColumn', {
            column: this.columnData.id,
            page
          })
        }
      } catch (error) {
        console.log(error);
        this.loading = false;
      }
    },
    async addColumnName() {
      if (this.columnData.title) {

        const payload = {
          name: this.columnData?.title || this.columnData?.name,
          color: this.columnData.color
        }

        this.columnData.new = false;
        if(isNaN(this.columnData.id)) {
          const response = await services.createColumn(this.kanban.columns.apiRoute, payload)
          this.columnData.id = response.data.id;
        } else {
          await services.updateColumn(this.kanban.columns.apiRoute, this.columnData.id, payload);
        }
        this.$emit('reorderColumns')

      }
    },

    async start(){
      this.dragColumn = true
    },
    /**/
    choose(){
      this.dragCursor = true
      this.columnSnapshot = [...this.columnData.data]
    },

    unchoose(){
      this.dragCursor = false
    },

    async change(){
      this.$emit('countTotalRecords')
    },

    async move(elm) {
      if (elm.from.id === elm.to.id) return false;
      const fromId = elm.from.id
      const toId = elm.to.id

      const from = this.kanbanColumns.find(item => item.id == fromId)
      const to = this.kanbanColumns.find(item => item.id == toId)
      const row = to.data.find(item => item.id == elm.clone.id)

      if(to?.options?.events){
        /* emits and pass the event to kanban */
        this.$emit('columnEvents', {
          col: from,
          row,
          event: {
            ...to.options.events.dragEnd,
            from,
            to,
            row,
            columnSnapshot: this.columnSnapshot

          }
        })

        return false
      } else {
        const data = { id: elm.clone.id, statusId: elm.to.id };
        row.loading = true

        await services.updateCard(this.kanban.cards.apiRoute, data.id, data).catch(error => {
          this.$emit('revertCard', from.id, to.id, row, this.columnSnapshot)
          row.loading = false
          this.columnSnapshot = null
          return
        })
        row.loading = false
        this.$emit('updateCardColumn', Number(toId));
      }
    },

    openModal(row = {}, isCreate = true, tab){
      this.$emit('openModal', {
        col: this.columnData,
        row,
        isCreate,
        tab
      })
    }
  },
};
</script>

<style>
/*
.columnCtn  {

  @apply tw-w-60;
}
  */


.dragCard {
  @apply tw-bg-white tw-transform tw-rotate-6;
  cursor: grabbing;
}

.ghostCard {
  @apply tw-opacity-40 tw-bg-white !important;
}

.arrowKanbanName .kanbanName .q-field__focusable-action {
  @apply tw--mt-4;
}
.arrowKanbanName .kanbanName .q-field--dense .q-field__control {
  @apply tw-h-6 tw-rounded-lg !important;
}
.arrowKanbanName .kanbanName .q-field--dense .q-field__control:before {
  @apply tw-border-0 tw-rounded-lg !important;
}
.arrowKanbanName .kanbanName .q-field--labeled .q-field__native,
.q-field--labeled .q-field__prefix,
.q-field--labeled .q-field__suffix {
  @apply tw-p-0;
}
.columnCtn .arrowKanbanName {
  width: calc(100% - 13px);
}
.columnCtn .arrowKanbanName .arrowKanban {
  height: 33px;
  width: 33px;
  border-radius: 10px;
  position: absolute;
  top: 4px;
  right: 3px;
  transform: rotate(45deg);
}
.columnCtn .c-plus {
    padding: 10px;
}
.columnCtn .c-body {
    background: #ffffff;
    border-radius: 0px;
}
.columnCtn .icon-edit {
  animation-name: slideUpReturn;
  animation-duration: .5s;
  animation-fill-mode: both;
  margin-top: 2px;
}
.columnCtn .icon-plus {
  animation-name: spaceInUp;
  animation-duration: .2s;
  animation-fill-mode: both;
}
@keyframes spaceInUp {
  0% {
    opacity: 0;
    -webkit-transform-origin: 50% 0%;
    transform-origin: 50% 0%;
    -webkit-transform: scale(0.2) translate(0%, -200%);
    transform: scale(0.2) translate(0%, -200%);
  }
  100% {
    opacity: 1;
    -webkit-transform-origin: 50% 0%;
    transform-origin: 50% 0%;
    -webkit-transform: scale(1) translate(0%, 0%);
    transform: scale(1) translate(0%, 0%);
  }
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
</style>
