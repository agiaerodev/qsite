<template>
  <q-popup-proxy
    v-if="canEdit"
    :cover="false"
    anchor="bottom start"
    transition-show="fade-in"
    transition-hide="fade-out"
    :max-width="dynamicField.maxWidth"
    ref="popupProxy"
    @before-show="setInitialValue"
  >
    <div class="q-pa-md relative-position bg-white" >
      <!-- Title -->
      <b class="text-blue-grey">
        {{ $tr('isite.cms.label.edit') }}: ID {{ row.id }} | {{ col.label }}
      </b>
      <q-separator class="q-mt-sm" />
      <!-- Form -->
      <q-form
        ref="propProxyForm"
        autocorrect="off"
        autocomplete="off"
        @submit="updateRow"
        @validation-success="successHandler()"
        @validation-error="errorHandler()">
          <div class="q-py-sm">
            <!-- Field -->
            <dynamic-field
              v-model="responseValue"
              :field="dynamicField"
              @update:model-value="$refs.propProxyForm.validate()"
            />
            <!--Actions-->
            <div class="justify-end row q-gutter-sm">
              <q-btn
                :label="$tr('isite.cms.label.cancel')"
                no-caps
                color="grey"
                unelevated
                rounded
                v-close-popup
              />
              <!-- submmit -->
              <q-btn
                :label="$tr('isite.cms.label.save')"
                color="green"
                no-caps unelevated
                rounded
                v-close-popup
                type="submit"
                :disabled="disableSubmit"
              />
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
