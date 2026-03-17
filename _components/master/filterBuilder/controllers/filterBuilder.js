import { ref, reactive, computed, watch } from 'vue';
import { copyToClipboard, Notify } from 'quasar';
import { cloneDeep } from 'lodash';
import { fieldTypes } from '../constants/fieldTypes';
import { toggles } from '../constants/toggles';
import { getCleanFilter } from '../models/FilterModel';
import { getIconForType, generateJson } from '../helpers/filterBuilderHelpers';

export default function useFilterBuilder(emit) {
  const filtersList = ref([]);
  const newOption = reactive({ label: '', value: '' });
  const newRequestParam = reactive({ name: '', value: '', type: 'string' });
  const editingIndex = ref(-1);
  let originalItemRef = null;
  const ignoreTypeWatch = ref(false);

  const currentFilter = ref(getCleanFilter());

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

  const generatedJson = computed(() => {
    try {
      return generateJson(filtersList.value);
    } catch (error) {
      console.error('Error generating JSON:', error);
      return '[]';
    }
  });

  const addFilter = () => {
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
      resetForm();
    } catch (error) {
      console.error('Error in addFilter:', error);
      Notify.create({ message: 'An unexpected error occurred while saving the filter.', color: 'red-7' });
    }
  };

  const editFilter = (index) => {
    try {
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

  const addStaticOption = () => {
    try {
      if (!newOption.label) return;
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
      .catch(error => {
        console.error('Failed to copy to clipboard:', error);
        Notify.create({ message: 'Failed to copy', color: 'red-7' });
      });
  };

  watch(generatedJson, (newVal) => {
    try {
      emit('update', JSON.parse(newVal));
    } catch (error) {
      console.error('Error emitting update event:', error);
    }
  }, { deep: true });

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
    getIconForType
  };
}
