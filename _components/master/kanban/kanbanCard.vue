<template>
  <div>
    <!-- content slot -->    
    <slot
      @openModal="openModal"
    />
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
      this.$emit('openModal')
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
