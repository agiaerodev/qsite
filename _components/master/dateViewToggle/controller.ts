import { reactive, onMounted, toRefs } from 'vue';
import { scheduleType } from './model'
import moment from 'moment'

export default function controller(props: any, emit: any) {

  const state = reactive({
    selectedDate: moment().format('YYYY/MM/DD'),
    typeAgenda: scheduleType[0].value,
    dateStart: moment().format('YYYYMMDD'),
    dateEnd: '',
  })

  const updateDateRange = () => {
    const DATE_FORMAT = 'YYYY/MM/DD'
    const selectedDate = moment(state.selectedDate, DATE_FORMAT);

    const isWeek = state.typeAgenda === scheduleType[0].value
    if(isWeek){
      state.dateStart = selectedDate.startOf("week").format('YYYYMMDD');
      state.dateEnd = selectedDate.endOf("week").format('YYYYMMDD');
    } else {
      state.dateStart = selectedDate.format('YYYYMMDD');
    }
  }

  const methods = {
    handleChange(){ 
      console.log('handleChange', state)
      updateDateRange()
      emit('update:modelValue', state)      
    },
  }

  onMounted(() => {
    props.modelValue && Object.assign(state, props.modelValue)
    updateDateRange()
  })

  return {
    ...(toRefs(state)), 
    ...methods, 
    store, 
    scheduleType
  }
}