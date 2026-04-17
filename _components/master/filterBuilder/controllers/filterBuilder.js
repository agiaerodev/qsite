import { ref, reactive, computed, watch, nextTick } from 'vue';
import { copyToClipboard, Notify } from 'quasar';
import { cloneDeep } from 'lodash';
import { fieldTypes } from '../constants/fieldTypes';
import { toggles } from '../constants/toggles';
import { getCleanFilter } from '../models/FilterModel';
import { getIconForType, generateJson } from '../helpers/filterBuilderHelpers';
import baseService from 'modules/qcrud/_services/baseService.js';

export default function useFilterBuilder(emit, props = {}) {
  const filtersList = ref([]);
  const newOption = reactive({ label: '', value: '' });
  const newRequestParam = reactive({ name: '', value: '', type: 'string' });
  const editingIndex = ref(-1);
  let originalItemRef = null;
  const ignoreTypeWatch = ref(false);
  const dataToLoad = computed(() => props.data?.[props.column] || {})
  const currentFilter = ref(getCleanFilter());

  // ====================
  // Inicialización desde Props
  // ====================
  function initializeFromProps() {
    if (typeof dataToLoad.value === 'string') {
      filtersList.value = [];
      return;
    }
    if (dataToLoad.value && Object.keys(dataToLoad.value).length > 0) {
      console.log('initializeFromProps - loading data:', dataToLoad.value);

      const loadedFilters = Object.entries(dataToLoad.value).map(
        ([key, value]) => {
          const filter = {
            key,
            value: value.value ?? null,
            type: value.type ?? 'input',
            props: value.props ?? {},
            quickFilter: value.quick_filter ?? false,
          };

          // For select type, reconstruct optionsSource and options
          if (filter.type === 'select') {
            // Priority 1: Check if props.options exists (static list)
            if (value.props?.options && Array.isArray(value.props.options) && value.props.options.length > 0) {
              console.log(`Filter '${key}' - detected static options:`, value.props.options);
              filter.optionsSource = 'static';
              filter.staticOptions = value.props.options.map(opt => ({
                label: opt.label,
                value: String(opt.value) // Convert to string for editing
              }));
              filter.loadOptions = { apiRoute: '', select: { label: 'name', id: 'id' }, requestParams: [] };
            }
            // Priority 2: Check if loadOptions exists (API)
            else if (value.loadOptions) {
              console.log(`Filter '${key}' - detected API options`);
              filter.optionsSource = 'api';
              filter.loadOptions = value.loadOptions;
              filter.staticOptions = [];
            }
            // Priority 3: Default to API
            else {
              console.log(`Filter '${key}' - no options found, defaulting to API`);
              filter.optionsSource = 'api';
              filter.staticOptions = [];
              filter.loadOptions = { apiRoute: '', select: { label: 'name', id: 'id' }, requestParams: [] };
            }
          }

          return filter;
        }
      );

      console.log('initializeFromProps - loaded filters:', loadedFilters);
      filtersList.value = loadedFilters;
    }
  }

  // ====================
  // Watchers
  // ====================
  watch(() => dataToLoad.value, (newData) => {
    if (newData && Object.keys(newData).length > 0) {
      console.log('[Watch dataToLoad] Datos cambiaron, re-inicializando desde props', newData);
      initializeFromProps();
    }
  }, { deep: true, immediate: false });

  watch(() => currentFilter.value.type, (newType, oldType) => {
    if (ignoreTypeWatch.value || newType === oldType) return;
    try {
      const oldFilter = cloneDeep(currentFilter.value);
      const newDefinition = getCleanFilter(newType);

      // Preserve common properties
      newDefinition.key = oldFilter.key;
      newDefinition.props.label = oldFilter.props.label;
      newDefinition.quickFilter = oldFilter.quickFilter;

      currentFilter.value = newDefinition;
      console.log('Filter definition updated for new type.');
    } catch (error) {
      console.error('Error watching currentFilter type:', error);
    }
  });

  // ====================
  // Computed
  // ====================
  const generatedJson = computed(() => {
    try {
      return generateJson(filtersList.value);
    } catch (error) {
      console.error('Error generating JSON:', error);
      return '[]';
    }
  });

  // ====================
  // Methods
  // ====================
  const addFilter = async () => {
    try {
      if (!currentFilter.value.key) {
        Notify.create({
          message: 'The ID Key is required',
          color: 'red-5',
          icon: 'fa-light fa-triangle-exclamation'
        });
        return;
      }

      const isDuplicate = filtersList.value.some(f =>
        f.key === currentFilter.value.key && f !== originalItemRef
      );

      if (isDuplicate) {
        Notify.create({
          message: 'This ID Key is already in use. Please choose a unique key.',
          color: 'amber-8',
          icon: 'fa-light fa-triangle-exclamation'
        });
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
        console.log('New filter added.');
      }
      await updateField();
      // El watch de filtersList se encargará de emitir el update automáticamente
      resetForm();
    } catch (error) {
      console.error('Error in addFilter:', error);
      Notify.create({ message: 'An unexpected error occurred while saving the filter.', color: 'red-7' });
    }
  };

  const editFilter = async (index) => {
    try {
      editingIndex.value = index;
      originalItemRef = filtersList.value[index];
      ignoreTypeWatch.value = true;

      const filterToEdit = filtersList.value[index];
      currentFilter.value = cloneDeep(filterToEdit);

      console.log('Editing filter:', currentFilter.value);

      // Ensure complex objects exist for editing
      if (currentFilter.value.type === 'select') {
        // Ensure loadOptions exists
        if (!currentFilter.value.loadOptions) {
          currentFilter.value.loadOptions = { apiRoute: '', select: { label: 'name', id: 'id' }, requestParams: [] };
        }

        // Ensure staticOptions exists
        if (!currentFilter.value.staticOptions) {
          currentFilter.value.staticOptions = [];
        }

        // CRITICAL FIX: If staticOptions is empty but props.options has data, reconstruct it
        if (currentFilter.value.staticOptions.length === 0 && currentFilter.value.props?.options && Array.isArray(currentFilter.value.props.options)) {
          console.log('Reconstructing staticOptions from props.options:', currentFilter.value.props.options);

          // Use Object.assign for better reactivity
          const newStaticOptions = currentFilter.value.props.options.map(opt => ({
            label: opt.label,
            value: String(opt.value)
          }));

          // Update the array reactively
          currentFilter.value.staticOptions = newStaticOptions;

          console.log('After reconstruction:', {
            count: currentFilter.value.staticOptions.length,
            items: currentFilter.value.staticOptions
          });
        }

        // Determine and set optionsSource if not already set
        if (!currentFilter.value.optionsSource) {
          if (currentFilter.value.staticOptions.length > 0) {
            currentFilter.value.optionsSource = 'static';
            console.log('Set optionsSource to static - found staticOptions');
          } else if (currentFilter.value.loadOptions?.apiRoute) {
            currentFilter.value.optionsSource = 'api';
            console.log('Set optionsSource to api - found apiRoute');
          } else {
            currentFilter.value.optionsSource = 'api';
            console.log('Set optionsSource to default api');
          }
        }

        console.log('After editFilter processing:', {
          optionsSource: currentFilter.value.optionsSource,
          staticOptions: currentFilter.value.staticOptions,
          propsOptions: currentFilter.value.props?.options
        });

        // FORCE REACTIVITY: Use nextTick to ensure Vue detects changes
        await nextTick();
        console.log('After nextTick - staticOptions count:', currentFilter.value.staticOptions.length);
      }
      ignoreTypeWatch.value = false;
    } catch (error) {
      console.error('Error in editFilter:', error);
      Notify.create({ message: 'Failed to load filter for editing.', color: 'red-7' });
    }
  };

  const resetForm = () => {
    currentFilter.value = getCleanFilter();
    editingIndex.value = -1;
    originalItemRef = null;
  };

  const deleteFilter = async (index) => {
    try {
      filtersList.value.splice(index, 1);
      await updateField();
      Notify.create({ message: 'Filter deleted', color: 'green-5', icon: 'fa-light fa-check' });
    } catch (error) {
      console.error('Error in deleteFilter:', error);
      Notify.create({ message: 'Failed to delete filter.', color: 'red-7' });
    }
  };

  const handleFiltersReordered = async (reorderedFilters) => {
    try {
      filtersList.value = reorderedFilters;
      await updateField();
    } catch (error) {
      console.error('Error reordering filters:', error);
      Notify.create({ message: 'Failed to reorder filters.', color: 'red-7' });
    }
  };

  const addStaticOption = () => {
    try {
      if (!newOption.label) return;
      if (!currentFilter.value.staticOptions) {
        currentFilter.value.staticOptions = [];
      }
      currentFilter.value.staticOptions.push({ ...newOption });
      newOption.label = '';
      newOption.value = '';
    } catch (error) {
      console.error('Error adding static option:', error);
    }
  };

  const addRequestParam = () => {
    try {
      if (!newRequestParam.name) return;
      currentFilter.value.loadOptions.requestParams.push({ ...newRequestParam });
      newRequestParam.name = '';
      newRequestParam.value = '';
      newRequestParam.type = 'string';
    } catch (error) {
      console.error('Error adding request param:', error);
    }
  };

  const handleCopy = () => {
    copyToClipboard(generatedJson.value)
      .then(() => Notify.create({ message: 'Copied', color: 'indigo' }))
      .catch((error) => {
        console.error('Failed to copy to clipboard:', error);
        Notify.create({ message: 'Failed to copy', color: 'red-7' });
      });
  };

  const updateField = async () => {
    try {
      await baseService.update('apiRoutes.qsite.cruds', props.data.id, {
        [props.column]: JSON.parse(generatedJson.value),
      });
    } catch (e) {
      console.log(e);
    }
  };

  // ====================
  // Emit Updates
  // ====================
  watch(filtersList, async (newVal) => {
    try {
      if (!newVal || newVal.length === undefined) return;
      emit('update', cloneDeep(newVal));
    } catch (error) {
      console.error('Error emitting update event:', error);
    }
  }, { deep: true, immediate: false });

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
    initializeFromProps,
    updateField,
    deleteFilter,
    handleFiltersReordered
  };
}
