import { computed } from 'vue';

export function useFilterFormController(props) {
  const visibleToggles = computed(() => {
    return props.toggles.filter(toggle =>
      !toggle.shouldDisplay || toggle.shouldDisplay(props.currentFilter)
    );
  });

  return {
    visibleToggles,
  };
}

