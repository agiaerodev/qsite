<template>
  <q-popup-proxy v-if="canEdit" :cover="false" anchor="bottom start"
                 transition-show="fade-in" transition-hide="fade-out"
                 :max-width="dynamicField.maxWidth" ref="popupProxy"
                 @show="setInitialValue">
    <div class="q-pa-md relative-position bg-white" >
      <!-- Title -->
      <b class="text-blue-grey">
        {{ $tr('isite.cms.label.edit') }}: ID {{ row.id }} | {{ col.label }}
      </b>
      <q-separator class="q-mt-sm" />
      <!-- Form -->
      <q-form autocorrect="off" autocomplete="off" @submit="updateRow"
              @validation-error="$alert.error($tr('isite.cms.message.formInvalid'))">
        <div class="q-py-sm">
          <!-- Field -->
          <dynamic-field v-model="responseValue" :field="dynamicField" />
          <!--Actions-->
          <div class="justify-end row q-gutter-sm">
            <q-btn :label="$tr('isite.cms.label.cancel')"
                   no-caps color="grey" unelevated rounded v-close-popup />
            <q-btn :label="$tr('isite.cms.label.save')" color="green"
                   no-caps unelevated rounded v-close-popup type="submit" />
          </div>
        </div>
      </q-form>
      <!-- Loading -->
      <inner-loading :visible="loading" />
    </div>
  </q-popup-proxy>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import controller from 'modules/qsite/_components/master/editablePopup/controller';

export default defineComponent({
  props: {
    row: { type: Object, default: null },
    col: { type: Object, default: null },
    beforeUpdate: {
      type: Function as PropType<() => void | null>,
      required: false,
      default: null
    }
  },
  setup (props, { emit })
  {
    return controller(props, emit);
  },
  components: {}
});
</script>
<style lang="scss">
</style>
