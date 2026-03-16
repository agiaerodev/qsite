// Single source of truth for filter types
export const fieldTypesConfig = {
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
        step: null
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
        mask: 'MM/DD/YYYY'
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
        format24h: false
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
        multiple: false
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
        clearable: true
      }
    })
  }
};

export const fieldTypes = Object.keys(fieldTypesConfig).map(key => ({
  value: key,
  label: fieldTypesConfig[key].label
}));
