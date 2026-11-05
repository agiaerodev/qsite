//Watch documentation of formats type here: http://www.ecma-international.org/ecma-402/2.0/#sec-intl-datetimeformat-constructor

const en = {
  day: {weekday: 'long',},
  month: {month: 'long'},
  year: {year: 'numeric'},
  small: {
    month: 'long', day: '2-digit'
  },
  short: {
    year: 'numeric', month: 'long', day: '2-digit'
  },
  long: {
    year: 'numeric', month: 'short', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false
  },
  explicit: {
    weekday: 'long', year: 'numeric', month: 'long', day: '2-digit'
  },
  time: {
    hour: '2-digit', minute: 'numeric', hour12: false
  },
  shortHuman: {
    weekday: 'long', day: '2-digit', month: 'long',
    hour: '2-digit', minute: 'numeric', hour12: false
  },
  dayHuman: {
    weekday: 'long', day: '2-digit', month: 'long'
  }
}

export default {
  'en-us': {
    ...en
  },
  'en' : {
    ...en
  },
  'es': {
    day: {weekday: 'long',},
    month: {month: 'long'},
    year: {year: 'numeric'},
    small: {
      month: 'long', day: '2-digit'
    },
    short: {
      year: 'numeric', month: 'long', day: '2-digit'
    },
    long: {
      year: 'numeric', month: 'short', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hour12: false
    },
    explicit: {
      weekday: 'long', year: 'numeric', month: 'long', day: '2-digit'
    },
    time: {
      hour: '2-digit', minute: 'numeric', hour12: false
    },
    shortHuman: {
      weekday: 'long', day: '2-digit', month: 'long',
      hour: '2-digit', minute: 'numeric', hour12: false
    },
    dayHuman: {
      weekday: 'long', day: '2-digit', month: 'long'
    }
  },
}
