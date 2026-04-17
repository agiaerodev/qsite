export const toggles = [
  {
    label: 'Quick Filter',
    model: 'quickFilter'
  },
  {
    label: 'Clearable',
    model: 'clearable'
  },
  {
    label: 'Multiple',
    model: 'multiple',
    shouldDisplay: (filter) => filter.type === 'select'
  },
  {
    label: '24-hour format',
    model: 'format24h',
    shouldDisplay: (filter) => filter.type === 'fullDate'
  }
];
