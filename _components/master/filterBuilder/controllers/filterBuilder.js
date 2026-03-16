import { ref, reactive, computed, watch } from 'vue';
import { copyToClipboard, Notify } from 'quasar';
import { cloneDeep } from 'lodash';

// Single source of truth for filter types
const fieldTypesConfig = {
  input: {
    label: 'Text Input',
    getDefinition: () => ({
      type: 'input',
      value: '',
      props: {
        label: '',
        hint: '',
        type: '',
        clearable: true,
        mask: '',
        step: null,
      }
    })
  },
  date: {
    label: 'Single Date',
    getDefinition: () => ({
      type: 'date',
      value: '',
      props: {
        label: '',
        hint: '',
        clearable: true,
        mask: 'MM/DD/YYYY',
      }
    })
  },
  fullDate: {
    label: 'Full Date Time',
    getDefinition: () => ({
      type: 'fullDate',
      value: '',
      props: {
        label: '',
        hint: '',
        clearable: true,
        mask: 'MM/DD/YYYY HH:mm',
        format24h: false,
      }
    })
  },
  select: {
    label: 'Select Dropdown',
    getDefinition: () => ({
      type: 'select',
      value: null,
      props: {
        label: '',
        clearable: true,
        multiple: false,
      },
      optionsSource: 'api',
      loadOptions: {
        apiRoute: '',
        select: { label: 'name', id: 'id' },
        requestParams: []
      },
      staticOptions: []
    })
  },
  dateRange: {
    label: 'Date Range',
    getDefinition: () => ({
      type: 'dateRange',
      value: { from: '', to: '' },
      props: {
        label: '',
        hint: '',
        clearable: true,
      }
    })
  }
};

export default function useFilterBuilder(emit) {
  const fieldTypes = computed(() => Object.keys(fieldTypesConfig).map(key => ({
    value: key,
    label: fieldTypesConfig[key].label
  })));

  const toggles = [
    { label: 'Quick Filter', model: 'quickFilter' },
    { label: 'Clearable', model: 'clearable' }
  ];

  const filtersList = ref([]);
  const newOption = reactive({ label: '', value: '' });
  const newRequestParam = reactive({ name: '', value: '' });
  const editingIndex = ref(-1);
  let originalItemRef = null;
  const ignoreTypeWatch = ref(false);

  const getCleanFilter = (type = 'input') => {
    const definition = fieldTypesConfig[type].getDefinition();
    return {
      key: '',
      quickFilter: false,
      ...cloneDeep(definition)
    };
  };

  const currentFilter = ref(getCleanFilter());

  watch(() => currentFilter.value.type, (newType, oldType) => {
    if (ignoreTypeWatch.value || newType === oldType) return;

    const oldFilter = cloneDeep(currentFilter.value);
    const newDefinition = getCleanFilter(newType);

    // Preserve common properties
    newDefinition.key = oldFilter.key;
    newDefinition.props.label = oldFilter.props.label;
    newDefinition.quickFilter = oldFilter.quickFilter;

    currentFilter.value = newDefinition;
  });

  const generatedJson = computed(() => {
    const output = {};
    filtersList.value.forEach(f => {
      const config = {
        value: f.value,
        type: f.type,
        props: {}
      };

      // Populate props, filtering out null/undefined values
      for (const key in f.props) {
        if (f.props[key] !== null && f.props[key] !== undefined && f.props[key] !== '') {
          config.props[key] = f.props[key];
        }
      }

      if (f.quickFilter) config.quickFilter = true;

      if (f.type === 'select') {
        if (f.optionsSource === 'api') {
          const lo = f.loadOptions;
          config.loadOptions = {
            apiRoute: lo.apiRoute,
            select: { label: lo.select.label, id: lo.select.id }
          };
          if (lo.requestParams?.length > 0) {
            const params = {};
            lo.requestParams.forEach(item => {
              if (item.value === 'true') params[item.name] = true;
              else if (item.value === 'false') params[item.name] = false;
              else if (!isNaN(Number(item.value)) && item.value.trim() !== '') params[item.name] = Number(item.value);
              else params[item.name] = item.value;
            });
            config.loadOptions.requestParams = params;
          }
        } else if (f.staticOptions.length > 0) {
          config.props.options = f.staticOptions.map(opt => ({
            label: opt.label,
            value: isNaN(opt.value) ? opt.value : Number(opt.value)
          }));
        }
      }
      output[f.key] = config;
    });
    return JSON.stringify(output, null, 2);
  });

  const addFilter = () => {
    if (!currentFilter.value.key) {
      Notify.create({ message: 'The ID Key is required', color: 'red-5', icon: 'fa-light fa-triangle-exclamation' });
      return;
    }

    const isDuplicate = filtersList.value.some(f =>
      f.key === currentFilter.value.key && f !== originalItemRef
    );

    if (isDuplicate) {
      Notify.create({ message: 'This ID Key is already in use. Please choose a unique key.', color: 'amber-8', icon: 'fa-light fa-triangle-exclamation' });
      return;
    }

    const filterCopy = cloneDeep(currentFilter.value);

    if (editingIndex.value >= 0) {
      const realIndex = filtersList.value.indexOf(originalItemRef);
      if (realIndex !== -1) {
        filtersList.value[realIndex] = filterCopy;
      }
      Notify.create({ message: 'Filter updated', color: 'green-5', icon: 'fa-light fa-check' });
    } else {
      filtersList.value.push(filterCopy);
    }
    resetForm();
  };

  const editFilter = (index) => {
    editingIndex.value = index;
    originalItemRef = filtersList.value[index];
    ignoreTypeWatch.value = true;
    currentFilter.value = cloneDeep(filtersList.value[index]);
    // Ensure complex objects exist for editing
    if (currentFilter.value.type === 'select' && !currentFilter.value.loadOptions) {
      currentFilter.value.loadOptions = { apiRoute: '', select: { label: 'name', id: 'id' }, requestParams: [] };
    }
     if (currentFilter.value.type === 'select' && !currentFilter.value.staticOptions) {
      currentFilter.value.staticOptions = [];
    }
    setTimeout(() => {
        ignoreTypeWatch.value = false;
    }, 100);
  };

  const resetForm = () => {
    currentFilter.value = getCleanFilter();
    editingIndex.value = -1;
    originalItemRef = null;
  };

  const addStaticOption = () => { if (!newOption.label) return; currentFilter.value.staticOptions.push({ ...newOption }); newOption.label = ''; newOption.value = '' };
  const addRequestParam = () => { if (!newRequestParam.name) return; currentFilter.value.loadOptions.requestParams.push({ ...newRequestParam }); newRequestParam.name = ''; newRequestParam.value = '' };
  const handleCopy = () => copyToClipboard(generatedJson.value).then(() => Notify.create({ message: 'Copied', color: 'indigo' }));

  const getIconForType = (type) => {
    const icons = {
      input: 'fa-light fa-input-text',
      select: 'fa-light fa-list-dropdown',
      date: 'fa-light fa-calendar-day',
      dateRange: 'fa-light fa-calendar-range',
      fullDate: 'fa-light fa-calendar-clock'
    };
    return icons[type] || 'fa-light fa-cube';
  };

  watch(generatedJson, (newVal) => emit('update', JSON.parse(newVal)), { deep: true });

  return {
    fieldTypes,
    toggles,
    filtersList,
    newOption,
    newRequestParam,
    editingIndex,
    currentFilter,
    generatedJson,
    addFilter,
    editFilter,
    resetForm,
    addStaticOption,
    addRequestParam,
    handleCopy,
    getIconForType,
  };
}
