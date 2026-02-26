<template>
  <div
    class="
      tw-bg-white
      tw-drop-shadow-lg
      tw-rounded-xl
      tw-border      
      tw-select-none
      tw-w-[212px]
      tw-py-[8px]
      tw-pr-[6px]
      tw-pl-[10px]
    "
    :style="{ borderLeftColor: colorColumn }"
    
  >    
    <!-- content slot -->
    <div>
      <slot 
        @openModal="value => openModal(value)"  
      />
    </div>
   
  </div>
</template>

<script>

export default {
  inject: {    
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
    
    openModal(value) {
      this.$emit('openModal', value)
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
