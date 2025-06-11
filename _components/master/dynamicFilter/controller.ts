import {computed, reactive, ref, onMounted, toRefs, watch} from "vue";
import { debounce } from 'quasar'
import _ from "lodash";
import service from 'modules/qsite/_components/master/dynamicFilter/services'
import { i18n, clone, store, router } from 'src/plugins/utils';
import moment from "moment";
import { Screen } from 'quasar'
import dateRangePickerRanges from 'modules/qsite/_components/master/dateRangePicker/constants'


export default function controller(props: any, emit: any) {
  // Refs
  const refs = {
    // refKey: ref(defaultValue)
  }

  // States
  const state = reactive({
    // Key: Default Value
    props: {
      filters: {},
      systemName: ''
    },
    filterValues: {},
    summary: {},
    readOnlyData: {},
    currentUrlFilter: '',
    dynamicFieldCache: true,
    quickFilters: {},
    quickFilterValues: {},
    loadedOptions: {},
    readValues: {},
    hidenFields: {},
    systemName: '',
    useAdminFilter: false,
    hasAppliedFilters: false,
    userData: {
      fields: [{
        //id: '',
        name: '',
        value: {}
      }],
      email: '',
      firstName: '',
      fullName: '',
      id: '',
      isActivated: '',
      lastName:'',
    }

  })

  // Computed
  const computeds = {
    filter: computed(() => {
      return {
        fields: state.props.filters,
      }
    }),

    model: computed({
      get() {
        return props.modelValue
      },
      set(newValue) {
        //emit('updateModelValue', newValue)
      }
    }),
    isMobile: computed(() => Screen.width < '500' ),
    //hide on mobile by default
    showFilters: computed(() => computeds.isMobile.value ? props.showOnMobile : true)
  }

  // Methods
  const methods = {

    setInputReadOnly(key, data){
      state.readOnlyData[key] = data
    },

    async init(options = { runGetUrlFilter: true }) {
      state.userData = clone(store.state.quserAuth.userData)
      state.props = clone(props)
      state.props.filters = methods.removeNullValues(state.props.filters)
      state.systemName = state.props?.systemName || ''
      state.useAdminFilter = state.userData.hasOwnProperty('fields')
      await methods.setFilterValues()

      if (options.runGetUrlFilter) await methods.getUrlFilters()
      await methods.addLoadedOptionsCallback()
      await methods.setQuickFilters()
      methods.emitValues()
    },

    showModal(){
      emit('showModal')
    },

    hideModal(){
      emit('hideModal')
    },

    // set values from crud
    async setFilterValues(){
      if(Object.keys(state.props.filters).length !== 0){
        Object.keys(state.props.filters).forEach(key => {
          //returns if initial value is null or an empty array
          if(!state.props.filters[key]?.value ) return 
          if( Array.isArray(state.props.filters[key]?.value)){
            if(!state.props.filters[key]?.value.length) return
          }

          state.filterValues[key] = state.props.filters[key]
          state.readOnlyData[key] = {
            label: state.props.filters[key]?.props?.label || '',
            value: state.props.filters[key].value
          }

          if(state.props.filters[key]?.quickFilter){
            state.quickFilterValues[key] = state.props.filters[key].value
          } else {
            if(state.props.filters[key]?.loadOptions){
              state.hidenFields[key] = {...state.props.filters[key]}
            }
          }
        })
      }
    },

    removeReadValue(key){
      delete state.readOnlyData[key];
      const value  = state.props.filters[key].props?.multiple ? [] : null
      state.filterValues[key] = value
      state.props.filters[key].value = value
      methods.emitValues(true)
    },

    async addLoadedOptionsCallback(){
      Object.keys(state.props.filters).forEach(key => {
        if(state.props.filters[key]?.type == 'select' || state.props.filters[key]?.type == 'treeSelect'){
          if(state.props.filters[key]?.loadOptions){
            //default options
            const options = state.props.filters[key]?.props?.options || []
            //loadedOptions callback
            state.props.filters[key].loadOptions.loadedOptions = (data) => {
              //fix setReadValues twice
              if(!state.loadedOptions[key]){
               state.loadedOptions[key] = [...options, ...data]
               methods.setReadValues()
              }
            }

            //(hiden) loadedOptions callback for url filters
             if(state.hidenFields[key]){
              state.hidenFields[key].loadOptions.loadedOptions = (data) => {
                //fix setReadValues twice
                if(!state.loadedOptions[key]){
                 state.loadedOptions[key] = [...options, ...data]
                 methods.setReadValues()
                }
              }
            }
          } else {
            state.loadedOptions[key] = state.props.filters[key]?.props?.options
          }
        } else if(state.props.filters[key]?.type == 'crud'){
          //loadedOptions callback for crud select
          if(!state.props.filters[key].props?.config) state.props.filters[key].props.config = {}
          state.props.filters[key].props.config.loadedOptions = (data) => {
            //fix setReadValues twice
            if(!state.loadedOptions[key]){
              state.loadedOptions[key] = [...data]
              methods.setReadValues()
            }
          }

          //(hiden) loadedOptions callback for url filters
          state.hidenFields[key] = {...state.props.filters[key]}
          if(!state.hidenFields[key].props?.config) state.hidenFields[key].props.config = {}
          state.hidenFields[key].props.config.loadedOptions = (data) => {
            //fix setReadValues twice
            if(!state.loadedOptions[key]){
              state.loadedOptions[key] = [...data]
              methods.setReadValues()
            }
          }
        }
      })
    },
    setReadValues(){
      const result = {}
      const summary = {}
      Object.keys(state.readOnlyData).forEach(key => {
        const field = state.props.filters[key];
        if(state.readOnlyData[key].value != null && state.readOnlyData[key].value && field?.type){
          result[key] = {
            label: state.readOnlyData[key].label || state.props.filters[key].label ||  '',
            value: state.readOnlyData[key].value,
            option: state.readOnlyData[key].value || '',
            quickFilterOption: {
              removable: state.props.filters[key]?.props?.clearable,
            }
          }

          if(field?.type == 'select' || field?.type == 'treeSelect'){
            if(state.loadedOptions[key]){
              const options = []
              const selectedValues = state.props.filters[key].props?.multiple ? state.readOnlyData[key].value : [state.readOnlyData[key].value]
              selectedValues.forEach((selectedValue) => {
                const option = state.loadedOptions[key].find((element) => {
                  const value = element.id ?? element.value
                  return value.toString() == selectedValue.toString()
                })
                if(option){
                  const optionLabel = option[field.loadOptions?.select?.label] || option.name || option.title || option.label || option.id || option.value || ''
                  if(optionLabel) options.push(optionLabel)
                }
              })
              result[key].option = options.join(', ')
            }
          } else if(field?.type == 'dateRange'){            
            result[key].option  = methods.setReadValuesTypeDateRange(key)            
          } else if(field?.type == 'crud'){
            result[key] = methods.setReadValuesTypeCrud(result[key], key)
          }
          /* add to summary */
          if(result[key]['value'] ){
            summary[key] = {...result[key]}
            if(!summary[key].value || (Array.isArray(summary[key].value) && !summary[key].value?.length)) delete summary[key]
          }
          if(field?.quickFilter || (Array.isArray(state.readOnlyData[key].value) && !state.readOnlyData[key].value.length) ) delete result[key];
        }
      });
      state.readValues = result
      state.summary = summary
      emit('update:summary', summary)
    },

    setReadValuesTypeDateRange(key){
      const dateFormat = state.props.filters[key].props?.mask || 'YYYY/MM/DD'
      let result = {
        from: state.readOnlyData[key].value?.from || null,
        to: state.readOnlyData[key].value?.to || null
      }

      if(state.readOnlyData[key].value?.type && !result.from && !result.to) {
        const ranges = dateRangePickerRanges.getDateRanges(dateFormat)
        const range = ranges[state.readOnlyData[key].value.type] || null
        if(range.value != ranges.customRange.value) result = range
      }
      return `${moment( new Date(result.from)).format('LL')} - ${moment( new Date(result.to)).format('LL')}`
    },

    //dynamicFiledtype: crud
    setReadValuesTypeCrud(result, key){
      //finds the label  crud props
      result.label = state.props.filters[key]?.props?.crudProps?.label || ''
      const labelKey = state.props.filters[key]?.props?.config?.options?.label || 'title'
      // find the options on loaded options
      if(state.loadedOptions[key]){
        const options = []
        const selectedValues = state.props.filters[key].props?.crudProps?.multiple ? result.value : [result.value]
          selectedValues.forEach((selectedValue) => {
            const option = state.loadedOptions[key].find((option) => {
              if(option.id.toString() == selectedValue.toString()){
                return option
              }
            })
            if(option){
              const optionLabel = option[labelKey] || option.name || option.title || option.label || option.id || option.value || ''
              if(optionLabel) options.push(optionLabel)
            }
        })
        result.option = options.join(', ')
      }
      return result
    },
    restoreFilterValues(){
      if(Object.keys(state.readValues).length > 0){
        Object.keys(state.readValues).forEach(key => {
          if(state.readValues[key].value != null && state.readValues[key].value != undefined){
            state.filterValues[key] = state.readValues[key].value
          }
        })
      }
      //restore from quickFilters
      if(Object.keys(state.quickFilters).length > 0){
        Object.keys(state.quickFilterValues).forEach(key => {
          state.filterValues[key] = state.quickFilterValues[key]
        })
      }
    },

    /* quickFiltres*/
    async setQuickFilters(){
      Object.keys(state.props.filters).forEach(key => {
        if(state.props.filters[key]?.quickFilter){
          state.quickFilters[key] = state.props.filters[key]
        }
      })
    },
    /* quickFiltres*/
    quickFilterHandler(key){
      state.readOnlyData[key] = {value: state.quickFilterValues[key], label: state.props.filters[key]?.props?.label }
      methods.emitValues(true)
    },

    //set the values to be emited
    emitValues(updateUserData = false){

      const filters = clone(state.readOnlyData)
      Object.keys(filters).forEach(key => {
        if(state.props.filters[key]?.quickFilter){
          state.quickFilterValues[key] = filters[key].value
        }
        if ( (filters[key].value === null) || (filters[key].value === undefined) || (filters[key].value === false) || filters[key].value === 0 || (Array.isArray(filters[key].value) && !filters[key].value?.length)) {
          delete filters[key];
        } else {
          filters[key] = filters[key].value
        }
      })
      // add props field
      Object.keys(filters).forEach(key => {
        if(state.props.filters[key]?.props?.field){          
          filters[key] = {...filters[key], field: state.props.filters[key].props.field}
          delete filters[key]?.label 
        }
      })
      state.hasAppliedFilters = (Object.keys(filters).length > 0)
      methods.setReadValues()
      methods.mutateURLFilters({...filters})
      methods.emitModelValue(filters)
      if(updateUserData && state.useAdminFilter){
        methods.setAdminFilter(filters)
      }
      methods.hideModal()
    },
    //emit
    emitModelValue:debounce((filters) => emit('update:modelValue', filters) , 800),

    /*url handlers */
    mutateURLFilters(filters) {
      if(!state.systemName) return
      const urlParams = methods.getUrlQueries()
      let paramsUrl = ''

      //removes the key if key only has value
      Object.keys(filters).forEach(key => {
        if(!state.props.filters[key]?.type){
          delete filters[key]
        }
      })


      urlParams[state.systemName] = JSON.stringify(filters)
      // remove from url if filters are empty
      if(urlParams[state.systemName]){
        if(Object.keys(filters).length === 0){
          delete urlParams[state.systemName]
        }
      }

      //remove key
      Object.keys(urlParams).forEach((key, index) => {
        const operator = (index === 0) ? '?' : '&'
        paramsUrl += `${operator}${key}=${urlParams[key]}`
      });

      const origin = window.location.href.split('?');
      const urlBase = `${origin[0]}${encodeURI(paramsUrl)}`;
      window.history.replaceState({}, '', urlBase);
    },

    async getUrlFilters(){
      if(!state.systemName) return

      let filterValues = {}
      const urlParams = methods.getUrlQueries()
      if(Object.keys(urlParams).length !== 0){
        if(urlParams[state.systemName]){
          filterValues = JSON.parse(urlParams[state.systemName])
        }
      }

      if(state.useAdminFilter){
        if(Object.keys(filterValues).length === 0){
          const filters = methods.getAdminFilter()
          filterValues = {...filters[state.systemName]}
        }
      }

      if(Object.keys(filterValues).length !== 0){
        Object.keys(filterValues).forEach(key => {
          if(!state.props.filters[key]) return

          state.filterValues[key] = filterValues[key]
          state.readOnlyData[key] = {
            label: state.props?.filters[key].props?.label || '',
            value: filterValues[key]
          }

          if(state.props.filters[key]?.quickFilter){
            state.quickFilterValues[key] = filterValues[key]
          } else {
            if(state.props.filters[key]?.loadOptions){
              state.hidenFields[key] = {...state.props.filters[key]}
            }
          }
        })
      }
    },

    getAdminFilter(){
      let filters = {}

      if(state.userData?.fields){
        if (Array.isArray(state.userData.fields)){
          if(state.userData.fields.length > 0){
            const adminFilters = state.userData.fields.find((element) => element.name == 'adminFilters') || false
            if(adminFilters && adminFilters?.value){
              return adminFilters.value
            }
          }
        }
      }
      return filters
    },

    async setAdminFilter(filters){
      if(!state.systemName) return
      const adminFilters = methods.getAdminFilter()

      if(Object.keys(adminFilters).length !== 0){
        state.userData.fields.find((element) => {
          if(element.name == 'adminFilters'){
            element.value[state.systemName] = filters
          }
        })
      } else {
        const valueFilter = {}
        valueFilter[state.systemName] = filters
        const fields = {
          name: 'adminFilters',
          value: {
            ...valueFilter,
          }
        }
        state.userData.fields.push(fields)
      }

      const data = {
        email: state.userData.email,
        fields: state.userData.fields,
        first_name: state.userData.firstName,
        full_name: state.userData.fullName,
        id: state.userData.id,
        is_activated: state.userData.isActivated,
        last_name: state.userData.lastName,
      }
      //update value on backend...
      const response = service.updateUserData(false, state.userData.id, data)
    },

    getUrlQueries(){
      const params = decodeURI(window.location).split('?')
      if(Array.isArray(params) ){
        if(params.length > 1){
          const query =  params[1]
            .split('&')
            .map(param => param.split('='))
            .reduce((values, [ key, value ]) => {
              values[ key ] = value
              return values
            }, {})
          return query
        }
      }
      return {}
    },
    //removes if filter.value is an empty object
    removeNullValues(filters){
      Object.keys(filters).forEach((filter) => {
        if(!filters[filter]?.value ) return
        if( Array.isArray(filters[filter]?.value)) return
        if (typeof filters[filter].value === 'object'){
          Object.keys(filters[filter].value).forEach((element) => {
            if (filters[filter].value[element] == null){
              delete filters[filter].value[element]
            }
          })

          //remove value if empty
          if(Object.keys(filters[filter].value).length == 0){
            filters[filter].value = null
          }
        }
      })
      return filters
    },
    loadFiltersFromAIResponse(response) {
      const values = Object.keys(response || {})
      if (values.length > 0) {
        values.forEach(key => {
          if (state.props.filters[key]) {
            state.filterValues[key] = response[key];
          }
          state.readOnlyData[key] = {
            label: state.props.filters[key]?.props?.label || '',
            value: response[key]
          }
        });
        methods.emitValues(true)
      }
    },
  }

  // Mounted
  onMounted(() => {
    methods.init()
  })

  // Watch
  watch(props, (newField, oldField): void => {
    const model = newField.modelValue
    if(model) {
      methods.restoreFilterValues()
    }

  }, {deep: true})

  return {...refs, ...(toRefs(state)), ...computeds, ...methods}
}
