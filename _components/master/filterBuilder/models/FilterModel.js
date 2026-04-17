import { cloneDeep } from 'lodash';
import { fieldTypesConfig } from '../constants/fieldTypes';

export function getCleanFilter(type = 'input') {
  const definition = fieldTypesConfig[type].getDefinition();
  return {
    key: '',
    quickFilter: false,
    ...cloneDeep(definition)
  };
}
