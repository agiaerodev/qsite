<template>
    <master-modal
      v-model="show"
      :persistent="true"
      customPosition
      maximized
      @hide="hideModal" 
      modalWidthSize="98%"
      title="Reglas de automatización"
    >
      <kanban
        :crudData="crudData"
        :heightColumn="170"
        :dragColumn="false"
      />
    </master-modal>
</template>
<script>

export default {
  props: {
  },
  inject:['init'],
  data() {
    return {
      show: false,
    }
  },
  computed: {
    crudData() {
      return {}
    }
  },
  methods: {
    hideModal() {
      this.show = false;
    },
    openModal() {
      this.show = true;
    }
  }
};
</script>