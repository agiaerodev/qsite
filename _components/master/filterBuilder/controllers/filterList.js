export function useFilterListController(emit) {
  const handleReorder = (newList) => {
    emit('update:filtersList', newList);
    emit('filters-reordered', newList);
  };

  return {
    handleReorder,
  };
}

