import {
  computed, 
  onMounted, 
  reactive, 
  ref, 
  toRefs 
} from 'vue';
import { Screen } from 'quasar'
import { store } from 'src/plugins/utils'
import services from './services'

export default function controller(props: any, emit: any) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  const BREAKPOINT = 639;

  recognition.continuous = true;
  recognition.lang = store.state.qsiteApp.defaultLocale;
  recognition.interimResult = false;

  const refs = {
    prompt: ref(""),
    record: ref(false),
    isOpenAiAsk: ref(false),
    loading: ref(false),
  }

  const state = reactive({
    extraPrompts: props?.extraPrompts || '',
    api: props?.api
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
          label: 'Ask a question',
          rows: Screen.width > BREAKPOINT ? 1 : 2,
          clearable: true,
          loading: refs.loading.value,
        },
      },
    }))
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
      if (refs.loading.value) return null
      
      if (!refs.prompt.value || refs.prompt.value?.trim() === "") return
      refs.loading.value = true;

      services.getResponseAI(state.api, `${state.extraPrompts} ${refs.prompt.value}`)
        .then(response => {
          emit('response', { ...response });
          refs.loading.value = false;
          refs.prompt.value = "";
        })
        .finally(() => {
          refs.loading.value = false;
          refs.record.value = false;
          recognition.abort();
        })
    },
    closeAiAsk: () => {
      refs.isOpenAiAsk.value = false;
      refs.record.value = false;
      try {
        recognition.abort();
      } catch (error) {
        console.error("Error aborting speech recognition:", error);
      }
    }
  }

  recognition.onresult = (event) => {
    const texto = event.results[event.results.length - 1][0].transcript
    refs.prompt.value = texto
  }

  recognition.onend = () => {
    refs.record.value = false;
  }

  return {...refs, ...(toRefs(state)), ...computeds, ...methods}
}
