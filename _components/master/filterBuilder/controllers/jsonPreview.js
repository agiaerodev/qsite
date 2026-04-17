export function useJsonPreviewController(props) {
  return {
    generatedJson: props.generatedJson,
    handleCopy: props.handleCopy,
  };
}

