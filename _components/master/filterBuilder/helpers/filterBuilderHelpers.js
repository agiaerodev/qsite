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
  filtersList.forEach(f => {
    const config = {
      value: f.value,
      type: f.type,
      props: {}
    };

    // Populate props, filtering out null/undefined values
    for (const key in f.props) {
      if (f.props[key] !== null && f.props[key] !== undefined && f.props[key] !== '') {
        config.props[key] = f.props[key];
      }
    }

    if (f.quickFilter) config.quickFilter = true;

    if (f.type === 'select') {
      if(f.props.multiple) config.value = [];
      if (f.optionsSource === 'api') {
        const lo = f.loadOptions;
        config.loadOptions = {
          apiRoute: lo.apiRoute,
          select: { label: lo.select.label, id: lo.select.id }
        };
        if (lo.requestParams?.length > 0) {
          const params = {};
          lo.requestParams.forEach(item => {
            if (item.value === 'true') params[item.name] = true;
            else if (item.value === 'false') params[item.name] = false;
            else if (!isNaN(Number(item.value)) && item.value.trim() !== '') params[item.name] = Number(item.value);
            else params[item.name] = item.value;
          });
          config.loadOptions.requestParams = params;
        }
      } else if (f.staticOptions.length > 0) {
        config.props.options = f.staticOptions.map(opt => ({
          label: opt.label,
          value: isNaN(opt.value) ? opt.value : Number(opt.value)
        }));
      }
    }
    output[f.key] = config;
  });
  return JSON.stringify(output, null, 2);
}
