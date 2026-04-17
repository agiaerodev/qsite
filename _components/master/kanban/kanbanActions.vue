<template>
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
    style="color: #AAAAAA"
    icon="fa-light fa-ellipsis-vertical"
    @click.stop
  >
    <q-list
      dense
      class="
        kd-list-without-arrow
        tw-bg-gray-100
        tw-text-xs
      "
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
            <div class="tw-flex tw-space-x-2 tw-py-2" :class="action?.class">
              <q-icon v-if="action?.icon" :name="action.icon" :color="action?.color" size="14px"/>
              <div class="tw-text-[12px]" :class="action?.class">
                {{ action.label || action.tooltip }}
              </div>
            </div>
          </q-item-section>
        </q-item>
      </template>
    </q-list>
  </q-btn-dropdown>
</template>

<script>

export default {
  props: {
    cardData: {
      type: Object,
      default: () => ({}),
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
  computed: {
    cardActions(){
      const actions = this.crudData.read.kanban?.actions || []
      const defaultActions = [
        {
          vIf: this.cardPermissions.edit,
          name: 'viewCard',
          label: this.$tr('isite.cms.label.edit'),
          icon: 'fa-light fa-pencil',
          class: 'tw-text-slate-500',
          action: (item) => {
            this.openModal()
          }
        },
        {
          vIf: this.cardPermissions.delete,
          name: 'deleteCard',
          icon: 'fa-light fa-trash',
          class: 'tw-text-slate-500',
          label: this.$tr('isite.cms.label.delete'),
          action: (item) => {
            this.deleteCard()
          }
        }
      ]

      return actions.length ? [...actions, ...defaultActions] : defaultActions;
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
      if (action.action) await action.action(actionData, this);
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
