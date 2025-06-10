import {
  computed,
  reactive, 
  ref, 
  toRefs 
} from 'vue';
import { store, eventBus } from 'src/plugins/utils'
import services from './services'

export default function controller(props: any, emit: any) {
  const SpeechRecognition = window?.SpeechRecognition || window?.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  recognition.continuous = true;
  recognition.lang = store.state.qsiteApp.defaultLocale;
  recognition.interimResult = false;

  const refs = {
    prompt: ref(""),
    record: ref(false),
    showPopup: ref(false),
    loading: ref(false),
    popupEdit: ref(null),
    responseAi: ref<null | string | object | any[]>(null),
  }

  const state = reactive({
    extraPrompts: props?.extraPrompts || '',
    api: props?.api,
    title: props?.title,
    fieldProps: props?.fieldProps,
  })

  const computeds = {
    field: computed(() => ({
      prompt: {
        name: "prompt",
        value: refs.prompt.value,
        type: "input",
        loading: refs.loading.value,
        props: {
          type: 'textarea',
          label: state.title,
          rows: 1,
          clearable: true,
          loading: refs.loading.value,
          ...state.fieldProps,
        },
      },
    })),
    isPrompt: computed(() => {
      return refs.prompt.value && refs.prompt.value.trim().length > 0;
    }),
    isResponseAi: computed(() => {
      if (
        (typeof refs.responseAi.value === 'object') && 
        !Array.isArray(refs.responseAi.value)
      ) {
        return Object.keys(refs.responseAi.value || {})?.length > 0 
      }

      if (
        (typeof refs.responseAi.value === 'string') || 
        Array.isArray(refs.responseAi.value)
      ) {
        return refs.responseAi.value?.length > 0;
      }
    })
  }

  const methods = {
    startRecord: () => {
      refs.record.value = !refs.record.value;
      try {
        if (refs.record.value) recognition.start();
        if (!refs.record.value) recognition.abort();
      } catch (error) {
        console.error("Error starting/stopping speech recognition:", error);
        refs.record.value = false;
      }
    },
    sendPrompt: () => {
      if (refs.loading.value) return
      
      if (!computeds.isPrompt.value) return
      refs.loading.value = true;

      services.getResponseAI(
        state.api,
        {
          prompt: refs.prompt.value,
          settings: state.extraPrompts
        }
      )
      .then(response => {
        emit('response', response);
        eventBus.emit('speechResponse', response)
        refs.responseAi.value = response;
      })
      .finally(() => {
        refs.loading.value = false;
        refs.record.value = false;
        recognition.abort();
      })
    },
    closeAiAsk: () => {
      refs.popupEdit.value?.hide()
      refs.showPopup.value = false;
      refs.record.value = false;
      try {
        recognition.abort();
      } catch (error) {
        console.error("Error aborting speech recognition:", error);
      }
    },
    
    rejectChange: () => {
      if (
        (typeof refs.responseAi.value === 'object') && 
        !Array.isArray(refs.responseAi.value)
      ) {
        refs.responseAi.value = Object.fromEntries(
          Object.keys(refs.responseAi.value || {}).map(key => [key, null])
        );
      }

      if (Array.isArray(refs.responseAi.value)) {
        refs.responseAi.value = []
      }

      if (typeof refs.responseAi.value === 'string') {
        refs.responseAi.value = ''
      }
      
      emit('response', refs.responseAi.value);
      eventBus.emit('speechResponse', refs.responseAi.value)

      // In case the response is an object, we ensure that it 
      // does not have values to hide the cancel changes button
      if (
        (typeof refs.responseAi.value === 'object') && 
        !Array.isArray(refs.responseAi.value)
      ) refs.responseAi.value = {}
    }
  }

  recognition.onresult = (event) => {
    const texto = event.results[event.results.length - 1][0].transcript
    refs.prompt.value = `${refs.prompt.value} ${texto}`
  }

  recognition.onend = () => {
    refs.record.value = false;
  }

  return {...refs, ...(toRefs(state)), ...computeds, ...methods}
}
