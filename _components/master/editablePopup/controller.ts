import { computed, reactive, ref, onMounted, toRefs, watch, markRaw, shallowRef } from 'vue';
import { alert, i18n } from 'src/plugins/utils.ts'

export default function controller (props, emit)
{

  // Refs
  const refs = {
    popupProxy: ref()
  };

  // States
  const state = reactive({
    // Key: Default Value
    responseValue: null,
    loading: false,
    canSubmit: false
  });

  // Computed
  const computeds = {
    //Get the dynamicField to edit
    dynamicField: computed(() =>
    {
      let field = props.col.dynamicField ?? null;
      // Validate if field is a function and format it
      if (typeof field == 'function') field = field(props.row);
      // Return field
      return field ? { name: props.col.name, maxWidth: '300px', ...field } : null;
    }),
    // Validate if edit is enable
    canEdit: computed(() =>
    {
      if (!computeds.dynamicField.value || !props.col.isEditable) return false;
      if (_.has(computeds.dynamicField.value, 'vIf')) return computeds.dynamicField.value.vIf
      return true;
    }),
    disableSubmit: computed(() => !state.canSubmit)
  };

  // Methods
  const methods = {
    //Instance the default response value
    setInitialValue ()
    {
      if (computeds.canEdit.value)
      {
        //Get the scope
        const scope = props.row[props.col.field || props.col.name];
        const dynamicField = computeds.dynamicField.value;
        //Instance the initial response value
        if (dynamicField.type == 'select' && !dynamicField.props?.multiple)
        {
          state.responseValue = scope.id;
        } else state.responseValue = scope;
      }
    },
    // methodKey: () => {}
    async updateRow ()
    {
      state.loading = true;
      const fieldName = computeds.dynamicField.value.name;
      //Instance tmpRow with new value
      let tmpRow = {
        ...props.row,
        [fieldName]: state.responseValue
      };
      //Emit the updateRow
      if (props.beforeUpdate)
      {
        await props.beforeUpdate({ val: state.responseValue, row: tmpRow, fieldName })
          .then(newTmpRow =>
          {
            state.loading = false;
            refs.popupProxy.value.hide();
            emit('updateRow', newTmpRow);
          }).catch((val) => state.loading = false);
      } else emit('updateRow', tmpRow);
    },
    successHandler(){
      state.canSubmit = true
    },
    errorHandler()
    {
      alert.error(i18n.tr('isite.cms.message.formInvalid'))
      state.canSubmit = false
    }


  };

  // Mounted
  onMounted(() =>
  {
  });

  // Watch
  // watch(key, (newField, oldField): void => {
  //
  // }, {deep: true})

  return { ...refs, ...(toRefs(state)), ...computeds, ...methods };
}
