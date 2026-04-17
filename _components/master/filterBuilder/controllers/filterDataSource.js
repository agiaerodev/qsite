import { computed } from 'vue';

export function useFilterDataSourceController(props) {
  // Computed property para optionsSource con valor por defecto
  const optionsSourceModel = computed({
    get() {
      return props.currentFilter.optionsSource || 'api';
    },
    set(value) {
      props.currentFilter.optionsSource = value;
    },
  });

  const removeStaticOption = (idx) => {
    props.currentFilter.staticOptions = props.currentFilter.staticOptions.filter(
      (_, i) => i !== idx
    );
  };

  const removeRequestParam = (idx) => {
    props.currentFilter.loadOptions.requestParams.splice(idx, 1);
  };

  return {
    optionsSourceModel,
    removeStaticOption,
    removeRequestParam,
  };
}

