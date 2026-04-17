// Single source of truth for filter types
export const fieldTypesConfig = {
  input: {
    label: 'Input',
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
        rules: [],
      }
    })
  },
  date: {
    label: 'Date',
    getDefinition: () => ({
      type: 'date',
      value: '',
      props: {
        label: '',
        hint: '',
        clearable: true,
        mask: 'MM/DD/YYYY',
        rules: [],
      }
    })
  },
  fullDate: {
    label: 'Full Date',
    getDefinition: () => ({
      type: 'fullDate',
      value: '',
      props: {
        label: '',
        hint: '',
        clearable: true,
        mask: 'MM/DD/YYYY HH:mm',
        format24h: false,
        rules: [],
      }
    })
  },
  select: {
    label: 'Select',
    getDefinition: () => ({
      type: 'select',
      value: null,
      props: {
        rules: [],
        label: '',
        clearable: true,
        multiple: false,
        options: []
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
  /*dateRange: {
    label: 'Date Range',
    getDefinition: () => ({
      type: 'dateRange',
      value: { from: '', to: '' },
      props: {
        label: '',
        hint: '',
        clearable: true,
        rules: [],
      }
    })
  }*/
};

export const fieldTypes = Object.keys(fieldTypesConfig).map(key => ({
  value: key,
  label: fieldTypesConfig[key].label
}));
