export function getIconForType(type) {
  const icons = {
    input: 'fa-light fa-input-text',
    select: 'fa-light fa-list-dropdown',
    date: 'fa-light fa-calendar-day',
    dateRange: 'fa-light fa-calendar-range',
    fullDate: 'fa-light fa-calendar-clock'
  };
  return icons[type] || 'fa-light fa-cube';
}

export function generateJson(filtersList) {
  const output = {};
  filtersList.forEach(filter => {
    const config = {
      value: filter.value,
      type: filter.type,
      props: {}
    };

    // Populate props, filtering out null/undefined values
    for (const key in filter.props) {
      if (
        key !== 'quickFilter' &&
        key !== 'options' && // Don't include options from props, handle separately
        filter.props[key] !== null &&
        filter.props[key] !== undefined &&
        filter.props[key] !== '') {
        config.props[key] = filter.props[key];
      }
    }

    if (filter.quickFilter) {
      config.quickFilter = true;
    }

    if (filter.type === 'select') {
      if(filter.props.multiple) config.value = [];
      if (filter.optionsSource === 'api') {
        const lo = filter.loadOptions;
        config.loadOptions = {
          apiRoute: lo?.apiRoute || lo?.api_route || '',
          select: { label: lo?.select?.label || 'name', id: lo?.select?.id || 'id' }
        };
        // Safety check for requestParams array
        if (lo?.requestParams && Array.isArray(lo.requestParams) && lo.requestParams.length > 0) {
          const params = {};
          lo.requestParams.forEach(item => {
            // Handle explicit types
            if (item.type === 'json') {
              try {
                params[item.name] = JSON.parse(item.value);
              } catch (e) {
                // Fallback to string if invalid JSON
                console.warn(`Invalid JSON for param ${item.name}:`, item.value);
                params[item.name] = item.value;
              }
            } else if (item.type === 'string') {
               params[item.name] = item.value;
            } else {
              // Legacy type inference for items without explicit type
              if (item.value === 'true') params[item.name] = true;
              else if (item.value === 'false') params[item.name] = false;
              else if (!isNaN(Number(item.value)) && item.value?.trim?.() !== '') params[item.name] = Number(item.value);
              else params[item.name] = item.value;
            }
          });
          config.loadOptions.requestParams = params;
        }
      } else if (filter.staticOptions && Array.isArray(filter.staticOptions) && filter.staticOptions.length > 0) {
        // Convert string booleans to actual booleans
        config.props.options = filter.staticOptions.map(opt => {
          let value = opt.value;
          // Handle string booleans
          if (value === 'true') {
            value = true;
          } else if (value === 'false') {
            value = false;
          } else if (!isNaN(Number(value)) && value !== '') {
            value = Number(value);
          }
          return {
            label: opt.label,
            value: value
          };
        });
      }
    }
    output[filter.key] = config;
  });
  return JSON.stringify(output, null, 2);
}
