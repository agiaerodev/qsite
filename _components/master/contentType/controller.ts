import {computed, reactive, ref, onMounted, toRefs, watch, markRaw, shallowRef, defineAsyncComponent} from "vue";
import { helper } from 'src/plugins/utils';
import components from 'modules/qsite/_components/master/contentType/components'

export default function controller(props, emit) {

  // Refs
  const refs = {
    // refKey: ref(defaultValue)
  }

  // States
  const state = reactive({
    // Key: Default Value
    component: shallowRef(),
    componentProps: null,
    componentEvents: null

  })

  // Computed
  const computeds = {
    // key: computed(() => {})
    isClickeable: computed(() => props.col?.onClick ? true : false),
    isEditable: computed(() => props.col?.dynamicField ? true : false),
    isComponent: computed(() => props.col?.contentType || false ),
    isLoading: computed(() => props.row?.isLoading || false),
    showOnLoading: computed(() =>  computeds.isLoading.value &&  (props.col?.name != 'id' || props.col?.field != 'id')),
    style: computed(() => props.col?.style || '')

  }

  // Methods
  const methods = {
    // methodKey: () => {}
    init() {
      methods.loadComponent();
    },
    loadComponent(){
      if(computeds.isComponent.value){
        const component = props.col.contentType(props.row, props.col)
        if(component?.template){
          state.component = methods.getComponent(component.template)
          if(component?.props) state.componentProps = component.props
          if(component?.events) state.componentEvents = component.events
        }
      }
    },

    getComponent(template){
      return (typeof template === 'string') ? markRaw(components[template]) : markRaw(template)
    },

    hasTooltip(){
      if(!props.col?.tooltip) return false
      return props.col?.tooltip(props.val, props.row) ? true :  false
    },

    getTooltip(){
      return props.col.tooltip(props.val, props.row)
    }
  }

  // Mounted
  onMounted(() => {
    methods.init()
  })

  // Watch
  watch(props, (newField, oldField): void => {
    methods.init()
  }, {deep: true})

  return {...refs, ...(toRefs(state)), ...computeds, ...methods}
}
