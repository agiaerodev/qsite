import { i18n, clone } from 'src/plugins/utils'
import moment from "moment";

export default {
  /*
    keyname and value must to be the same ie:
    nextDate: {
      value: 'nexDate'
    },
  */
  getDateRanges(dateFormat) {
    return {
      customRange: {
        label: i18n.tr('isite.cms.label.customRange'),
        value: 'customRange'
      },    
      today: {           
        label: i18n.tr('isite.cms.label.today')      ,
        from: moment().format(dateFormat),
        to: moment().format(dateFormat), 
        value: 'today'
      }, 
      yesterday: {
        label: i18n.tr('isite.cms.label.yesterday'),       
        from: moment().subtract(1, 'd').format(dateFormat), 
        to:  moment().subtract(1, 'd').format(dateFormat), 
        value: 'yesterday'
      }, 
      tomorrow: {
        label: i18n.tr('isite.cms.label.tomorrow'), 
        from: moment().add(1, 'd').format(dateFormat),
        to: moment().add(1, 'd').format(dateFormat),
        value: 'tomorrow'
      },
      lastSevenDays: {
        label: i18n.tr('isite.cms.label.LastNumDays', {numDays: 7}), 
        from: moment().subtract(6, 'd').format(dateFormat),
        to:  moment().format(dateFormat),
        value: 'lastSevenDays'
      },
      lastThirtyDays: {
        label: i18n.tr('isite.cms.label.LastNumDays', {numDays: 30}),
        from: moment().subtract(29, 'd').format(dateFormat),
        to: moment().format(dateFormat),
        value: 'lastThirtyDays'
      },
      lastSixtyDays: {
        label: i18n.tr('isite.cms.label.LastNumDays', {numDays: 60}),
        from: moment().subtract(59, 'd').format(dateFormat),
        to: moment().format(dateFormat), 
        value: 'lastSixtyDays'
      },
      currentWeek: {
        label: i18n.tr('isite.cms.label.currentWeek'),
        from: moment().startOf('week').format(dateFormat),
        to: moment().endOf('week').format(dateFormat),
        value: 'currentWeek'
      },
      lastWeek: {
        label: i18n.tr('isite.cms.label.lastWeek'), 
        from: moment().subtract(1, 'weeks').startOf('week').format(dateFormat),
        to: moment().subtract(1, 'weeks').endOf('week').format(dateFormat),
        value: 'lastWeek'
      },
      nextWeek: {
        label: i18n.tr('isite.cms.label.nextWeek'),
        from: moment().add(1, 'weeks').startOf('week').format(dateFormat),
        to: moment().add(1, 'weeks').endOf('week').format(dateFormat),
        value: 'nextWeek'
      },
      nextFifteenDays: {
        label: 'Next 15 Days',
        from: moment().startOf('day').format(dateFormat),
        to: moment().add(14, 'days').endOf('day').format(dateFormat),
        value: 'nextFifteenDays'
      },
      nextThirtyDays: {
        label: 'Next 30 Days',
        from: moment().startOf('day').format(dateFormat),
        to: moment().add(29, 'days').endOf('day').format(dateFormat),
        value: 'nextThirtyDays'
      },
      nextNinetyDays: {
        label: 'Next 90 Days',
        from: moment().startOf('day').format(dateFormat),
        to: moment().add(89, 'days').endOf('day').format(dateFormat),
        value: 'nextNinetyDays'
      },
      nextMonth: {
        label: i18n.tr('isite.cms.label.nextMonth'),
        from: moment().add(1, 'months').startOf('month').format(dateFormat),
        to: moment().add(1, 'months').endOf('month').format(dateFormat),
        value: 'nextMonth'
      },
      currentMonth: {
        label: i18n.tr('isite.cms.label.currentMonth'),
        from: moment().startOf('month').format(dateFormat),
        to: moment().endOf('month').format(dateFormat),
        value: 'currentMonth'
      },
      lastMonth: {
        label: i18n.tr('isite.cms.label.lastMonth'),
        from: moment().subtract(1, 'months').startOf('month').format(dateFormat),
        to: moment().subtract(1, 'months').endOf('month').format(dateFormat),
        value: 'lastMonth'
      },
      twoMonthsAgo: {
        label: i18n.tr('isite.cms.label.numMonthsAgo', {numMonths: 2}), 
        from: moment().subtract(2, 'months').startOf('month').format(dateFormat), 
        to: moment().subtract(2, 'months').endOf('month').format(dateFormat), 
        value: 'twoMonthsAgo'
      },
      currentYear: {
        label: i18n.tr('isite.cms.label.currentYear'), 
        from: moment().startOf('year').format(dateFormat),
        to: moment().endOf('year').format(dateFormat),
        value: 'currentYear'
      },
      lastYear: {
        label: i18n.tr('isite.cms.label.lastYear'), 
        from: moment().subtract(1, 'year').startOf('year').format(dateFormat),
        to: moment().subtract(1, 'year').endOf('year').format(dateFormat),
        value: 'lastYear'
      },
      twoYearsAgo: {
        label: i18n.tr('isite.cms.label.numYearsAgo', {numYears: 2}),
        from: moment().subtract(2, 'year').startOf('year').format(dateFormat),
        to: moment().subtract(2, 'year').endOf('year').format(dateFormat),
        value: 'twoYearsAgo'
      },
      lastTwoYears: {
        label: i18n.tr('isite.cms.label.lastNumYears', {numYears: 2}),
        from: moment().subtract(1, 'year').startOf('year').format(dateFormat),
        to: moment().endOf('year').format(dateFormat),
        value: 'lastTwoYears'
      },
      ['15daysAroundToday']: {
        label: i18n.tr('isite.cms.label.daysAroundToday', {numDays: 15}), 
        from: moment().subtract(7, 'days').format(dateFormat),
        to: moment().add(7, 'days').format(dateFormat),
        value: '15daysAroundToday'
      },
      ['5daysAroundToday']: {
        label: i18n.tr('isite.cms.label.daysAroundToday', {numDays: 5}), 
        from: moment().subtract(2, 'days').format(dateFormat),
        to: moment().add(2, 'days').format(dateFormat),
        value: '5daysAroundToday'
      } 
    }
      
  }, 
  getDateRangesOptions(dateFormat){
    const dateRanges = this.getDateRanges(dateFormat)
    return Object.keys(dateRanges).reduce((arr, e) => {
      arr.push({label: dateRanges[e].label, value: dateRanges[e].value}) 
      return arr
    }, [])
  }  
}
