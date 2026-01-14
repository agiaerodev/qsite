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
                v-for="(action, keyAction) in actionsAutomations"
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
                      <q-icon :name="action.icon" color="primary" size="20px"/>
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
    <div
      @click="() => {
        if(this.cardPermissions.edit){
          runShowModal(cardData)
        }
      }"
    >
      <slot name="content" />
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
    actions() {
      return this.crudfieldActions(this.cardData);
    },
    
    
    actionsAutomations() {
      let automationActions = [
       //Delete action
        {
          icon: 'fa-light fa-trash-can',
          color: 'red',
          label: this.$tr('isite.cms.label.delete'),
          action: (item) => {
            if(this.deleteKanbanCard) this.deleteKanbanCard(item);
          }
        },
        {
          icon: 'fa-light fa-pencil',
          color: 'red',
          label: this.$tr('isite.cms.label.edit'),
          action: (item) => {
            if(this.openFormComponentModal) this.openFormComponentModal(item.statusId, item.title, item.id);
          }
        }
      ];

      const defaultActions = [
        //Edit card  action 
         {
          name: 'viewLead',
          icon: 'fas fa-info-circle',
          color: 'info',
          tooltip: this.$tr('isite.cms.label.information'),
          vIf: this.cardPermissions.edit,
          action: (item) => {
           this.runShowModal(this.cardData)
          }
        },
        {
          icon: 'fa-light fa-trash-can',
          color: 'red',
          label: this.$tr('isite.cms.label.delete'),
          vIf: this.cardPermissions.delete,
          action: (item) => {
            if(this.deleteKanbanCard) this.deleteKanbanCard(item);
          }
        },
      ];

      let response = [...this.actionsData, ...defaultActions];


      return this.automation ?  automationActions : response;
    },
    actionsData() {
      return this.actions.map((item) => {
        //Instance item props
        item.props = { tag: "a", key: this.$uid(), clickable: true };

        //Define external redirect
        if (item.toRoute) item.props.href = item.toRoute;

        //Instance vue route redirect
        if (item.route)
          item.props.to = {
            name: item.route,
            params: this.$clone(this.cardData || {}),
          };

        // Formatting all instances
        if (item.format)
          item = { ...item, ...(item.format(this.cardData) || {}) };

        //Return item
        return item;
      });
    },
  },
  methods: {
    openModal() {
      if (this.showRequestData) this.showRequestData(this.cardData);
    },
    openEdit() {
      if (this.update) this.update(this.cardData);
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
