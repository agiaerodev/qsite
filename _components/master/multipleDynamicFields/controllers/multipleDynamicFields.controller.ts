import { ref, computed, onMounted, watch, nextTick, provide } from "vue";
import reateEmptyObjectFromFields from 'modules/qsite/_components/master/multipleDynamicFields/helpers/reateEmptyObjectFromFields.helper'
import _ from 'lodash'

export default function multipleDynamicFieldsController(props: any, emit: any) {
  const valueMultiple = ref(props.modelValue || []);
  const fieldProps: any = computed(() => props.fieldProps);
  const defaultField = computed(() => props.fieldProps.fields);
  const fields: any = ref([]);
  const maxQuantity = computed(() => fields.value.length === (fieldProps.value?.maxQuantity || 5))
  const isMinQuantity = computed(() => fields.value.length === (fieldProps.value?.minQuantity || 0))
  const refDraggable: any = ref(null)
  const loading = ref(false);
  const formFields = ref([]);
  function add(): void {
    const fromFields = reateEmptyObjectFromFields(defaultField.value);
    if(maxQuantity.value) return;
    fields.value.push(fromFields);
    //There is a small delay when adding a new item,
    //so a small delay is added for the
    //scroll is executed correctly
    nextTick(() => {
      setTimeout(() => {
        const element = refDraggable.value.$el;
        const height = element.scrollHeight;
        element.scrollTo({
          top: height,
          behavior: 'smooth'
        });
      }, 100)
    });
  }
  function deleteItem(index: number): void {
    fields.value.splice(index, 1);
  }
  function summary(item = null, index = null) {
    if (typeof fieldProps.value?.summary === 'function') {
      return fieldProps.value?.summary(item, index);
    } else if (typeof fieldProps.value?.summary === 'string') {
      return fieldProps.summary;
    }
    return null;
  }
  function tranformField(formField, index = null, field = null) {
    if(fieldProps.value?.customRules) {
      return fieldProps.value?.customRules(formField, index, field);
    } else {
      return formField;
    }
  }

  watch(fields, (newField, oldField): void => {
    if(newField) {
      const filteredFields = newField.map(field => {
        const filtered = {};
        Object.keys(field).forEach(key => {
          if (key in defaultField.value) {
            filtered[key] = field[key];
          }
        });

        return filtered;
      });
      emit('update:modelValue', _.cloneDeep(filteredFields));
    }
  }, { deep: true });

  watch(
    () => props.modelValue,
    (newValue) => {
      // Solo actualizar si el nuevo valor es diferente
      if (!_.isEqual(valueMultiple.value, newValue)) {
        valueMultiple.value = newValue || [];
        updateFieldsFromValueMultiple()
      }
    },
    { immediate: true }
  );

  onMounted(() => {
    init()
  });
  function updateFieldsFromValueMultiple() {
    const fromFields = reateEmptyObjectFromFields(defaultField.value)
    const multipleValue = valueMultiple.value
    if (multipleValue.length > 0) {
      fields.value = multipleValue.map(value => {
        return {
          ...fromFields,
          ...value
        }
      });
    } else {
      const minQuantity = fieldProps.value?.minQuantity || 0;
      Array.from({length: minQuantity}).forEach(() => {
        fields.value.push(fromFields);
      })
    }
    multipleValue.forEach((field, index) => {
      if (formFields.value[index]) {
        formFields.value[index] = _.cloneDeep({
          ...formFields.value[index],
        });
      } else {
        formFields.value.push(_.cloneDeep({
          ...defaultField.value,
        }));
      }
    });

    formFields.value = _.cloneDeep(formFields.value.slice(0, fields.value.length));
  }
  function init() {
    nextTick(() => {
      updateFieldsFromValueMultiple();
    })
  }
  return {
    fields,
    fieldProps,
    defaultField,
    add,
    deleteItem,
    maxQuantity,
    isMinQuantity,
    refDraggable,
    summary,
    loading,
    formFields,
    tranformField
  };
}
