<template>
  <div
    class="
      tw-bg-white
      tw-shadow
      tw-rounded
      tw-px-3
      tw-pt-3
      tw-pb-2
      tw-border-l-2
      tw-my-2
      kb-card
      tw-select-none
    "
    :style="{ borderLeftColor: colorColumn }"
    
  >
    <section class="tw-flex tw-justify-between">
      <div class="tw-w-full">
        <div class="tw-flex">
          <div class="tw-w-full">
            <!-- header slot -->
            <slot name="header">
            </slot>
          </div>
          
          <q-btn-dropdown
            round
            color="gray-4"
            flat
            size="12px"
            padding="2px 4px"
            class="
              kd-without-arrow
              tw-float-right
              tw-cursor-pointer
              tw-text-xs              
              tw-h-7
            "
            icon="fa-light fa-ellipsis-vertical"
            @click.stop
          >          
            <q-list
              dense
              class="
                kd-list-without-arrow
                tw-bg-gray-100
                tw-text-xs"
            >
              <template
                v-for="(action, keyAction) in cardActions"
                :key="keyAction"
              >
              <q-item
                clickable
                v-close-popup
                v-if="action?.vIf != undefined ? action?.vIf : true"
                v-bind="action.props"
                @click.native="runAction(action)"
              >
                  <q-item-section>
                    <div class="tw-flex tw-space-x-2 tw-py-2">
                      <q-icon v-if="action?.icon" :name="action.icon" color="primary" size="20px"/>
                      <div class="tw-mt-0.5 tw-font-semibold">
                        {{ action.label || action.tooltip }}
                      </div>
                    </div>
                  </q-item-section>
              </q-item>
              </template>
            </q-list>
          </q-btn-dropdown>
        </div>
      </div>
    </section>

    <!-- content slot -->
    <div>
      <slot 
        @openModal="openModal"
        name="content"
      />
    </div>
   
  </div>
</template>

<script>

export default {
  inject: {
    showRequestData: {
      type: Function,
      default: () => false,
    },
    update: {
      type: Function,
      default: () => false,
    },
    automation: {
      type: Boolean,
      default: () => false,
    },
    crudfieldActions: {
      type: Function,
      default: () => false,
    },
    deleteKanbanCard:  {
      type: Function,
      default: () => false,
    },
    openFormComponentModal:  {
      type: Function,
      default: () => false,
    },
    runShowModal: {
      type: Function,
      default: () => false,
    },
  },
  props: {    
    cardData: {
      type: Object,
      default: () => this.cardDataDefault,
    },
    cardPermissions: {
      type: Object,
      default: () => ({}),
    },
    crudData: {
      type: Object,
      default: () => ({}),
    },
    colorColumn: {
      type: String,
      default: () => "#00000",
    },
  },
  data() {
    return {
      cardDataDefault: {
        id: 0,
        title: '',
        type: '',
        createdAt: '',
        fields: [],
        responsible: {
          firstName: '',
          lastName: '',
        },
      },
    };
  },
  computed: {
    kanban(){
      return this.crudData?.kanban || null;
    },
    cardActions(){      
      const defaultActions = [
        {
          vIf: this.cardPermissions.edit,
          name: 'viewCard',            
          label: this.$tr('isite.cms.label.information'),
          icon: 'fas fa-info-circle',
          action: (item) => {
            this.openModal()
          }
        },
        {
          vIf: this.cardPermissions.delete, 
          name: 'deleteCard',            
          icon: 'fa-light fa-trash-can',
          color: 'red',
          label: this.$tr('isite.cms.label.delete'),
          action: (item) => {            
            this.deleteCard()
          }
        }
      ]

      return [...this.crudData.read.kanban?.actions, ...defaultActions]  || defaultActions;
    },
  },
  methods: {
    
    openModal() {
      this.$emit('openModal', this.cardData)
    },    
    deleteCard(){
      this.$emit('deleteCard', this.cardData)
    },
    async runAction(action) {
      //Define action params
      let actionData = this.$clone(this.cardData || {});
      //Check if has action function
      if (action.action) await action.action(actionData);
    },
  },
};
</script>
<style lang="scss">
.kd-without-arrow {
  .q-btn-dropdown__arrow {
    @apply tw-hidden;
  }
}
</style>
