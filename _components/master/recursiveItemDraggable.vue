<template>
  <div id="recurisveItemDraggable">
    <!-- draggabel container -->
    <draggable
        tag="div"
        v-bind="dragOptions"
        :list="items"
        :group="{ name: 'g1' }"
        item-key="id"
        ghost-class="ghost"
    >
      <template #item="{ element }">
        <div
          class="drag-group"
          :key="element.id"
        >
          <!-- list -->
          <div class="row justify-between items-center q-my-md q-ml-sm item">
            <!-- name -->
            <div class="col-10 row q-py-xs blue-green items-center">
              <div :class="{'q-py-md': element.subTitle }">
                <q-icon class="cursor-pointer q-pr-sm" color="blue-grey" name="fa-light fa-bars"/>
              </div>
              <div class="text-subtitle2 text-weight-light tw-truncate" :class="{'q-py-xs': element.subTitle}">
                {{ element.title }}
                <span v-if="!!element.subTitle" class="block text-caption text-grey-8">
                <span v-html="element.subTitle"/>
              </span>
              </div>
            </div>
            <!-- menu actions -->
            <div class="col-2 text-right q-py-xs relative-position">
              <btn-menu
                v-if="element.actions.length"
                :actions="element.actions"
                :action-data="element"
              />
            </div>
          </div>
          <!-- recursive dragabble -->
          <nestedDraggable
            :class="`${element.children.length} ?: q-mb-sm q-ml-md`"
            :items="element.children"
            v-if="nested"
          />
        </div>
      </template>
    </draggable>
  </div>
</template>

<script>
import draggable from 'vuedraggable'

export default {
  name: 'nestedDraggable',
  components: {
    draggable,
  },
  props: {
    items: {
      required: true,
      type: Array,
      default: () => []
    },
    deleteApi: {
      type: String
    },
    disabled: {
      required: false,
      type: Boolean,
      default: () => false,
    },
    nested: {type: Boolean, default: true}
  },
  computed: {
    dragOptions() {
      return {
        animation: 200,
        group: "description",
        disabled: this.disabled,
        ghostClass: "ghost"
      };
    },
  },
};
</script>

<style lang="scss">
#recurisveItemDraggable {
  .drag-group {
    margin-top: 5px;
    margin-bottom: 5px;
    cursor: move;
    display: block;
    .item {
      padding: 16px 18px;
      border-radius: 14px;
      border: 1px solid #d3d3d3;
      margin-bottom: 10px;
    }
  }

  .ghost {
    border: 1px dashed #0088F8;
    background: rgba(0, 136, 249, 0.09);
    font-size: 0px;

    button {
      display: none;
    }
  }
}
</style>
