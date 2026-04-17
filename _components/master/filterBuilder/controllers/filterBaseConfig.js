import { computed } from 'vue';

export function useFilterBaseConfigController(props) {
  const visibleToggles = computed(() => {
    return props.toggles.filter(toggle =>
      !toggle.shouldDisplay || toggle.shouldDisplay(props.currentFilter)
    );
  });

  return {
    visibleToggles,
  };
}

