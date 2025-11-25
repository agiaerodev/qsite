import store from '../store/index';
import moment from 'moment';
import { startDateFormat, endDateFormat } from 'modules/qsite/_components/master/kanban/constants/constants';

export default async function changeDate(): Promise<void> {
    switch (store.filterDate) {
        case 'today':
            store.from = moment().format(startDateFormat)
            store.to = moment().format(endDateFormat)
            break;
        case 'yesterday':
            store.from = moment().subtract(1, 'd').format(startDateFormat)
            store.to = moment().subtract(1, 'd').format(endDateFormat)
            break;
        case 'tomorrow':
            store.from = moment().add(1, 'd').format(startDateFormat)
            store.to = moment().add(1, 'd').format(endDateFormat)
            break;
        case 'lastSevenDays':
            store.from = moment().subtract(6, 'd').format(startDateFormat)
            store.to = moment().format(endDateFormat)
            break;
        case 'currentWeek':
            store.from = moment().startOf('isoWeek').format(startDateFormat)
            store.to = moment().endOf('isoWeek').format(endDateFormat)
            break;
        case 'lastWeek':
            store.from = moment().subtract(1, 'weeks').startOf('isoWeek').format(startDateFormat)
            store.to = moment().subtract(1, 'weeks').endOf('isoWeek').format(endDateFormat)
            break;
        case 'nextWeek':
            store.from = moment().add(1, 'weeks').startOf('isoWeek').format(startDateFormat)
            store.to = moment().add(1, 'weeks').endOf('isoWeek').format(endDateFormat)
            break;
        case 'lastThirtyDays':
            store.from = moment().subtract(29, 'd').format(startDateFormat)
            store.to = moment().format(endDateFormat)
            break;
        case 'lastSixtyDays':
            store.from = moment().subtract(59, 'd').format(startDateFormat)
            store.to = moment().format(endDateFormat)
            break;
        case 'currentMonth':
            store.from = moment().startOf('month').format(startDateFormat)
            store.to = moment().endOf('month').format(endDateFormat)
            break;
        case 'lastMonth':
            store.from = moment().subtract(1, 'months').startOf('month').format(startDateFormat)
            store.to = moment().subtract(1, 'months').endOf('month').format(endDateFormat)
            break;
        case 'nextMonth':
            store.from = moment().add(1, 'months').startOf('month').format(startDateFormat)
            store.to = moment().add(1, 'months').endOf('month').format(endDateFormat)
            break;
        case 'twoMonthsAgo':
            store.from = moment().subtract(2, 'months').startOf('month').format(startDateFormat)
            store.to = moment().subtract(2, 'months').endOf('month').format(endDateFormat)
            break;
        case 'twoYearsAgo':
            store.from = moment().subtract(2, 'year').startOf('year').format(startDateFormat)
            store.to = moment().subtract(2, 'year').endOf('year').format(endDateFormat)
            break;
        case 'lastYear':
            store.from = moment().subtract(1, 'year').startOf('year').format(startDateFormat)
            store.to = moment().subtract(1, 'year').endOf('year').format(endDateFormat)
            break;
        case 'lastTwoYears':
            store.from = moment().subtract(1, 'year').startOf('year').format(startDateFormat)
            store.to = moment().endOf('year').format(endDateFormat)
            break;
        case 'currentYear':
            store.from = moment().startOf('year').format(startDateFormat)
            store.to = moment().endOf('year').format(endDateFormat)
            break;
        case 'customRange':
            if (store.from)
                store.from = moment(store.from).format(startDateFormat)
            if (store.to)
                store.to = moment(store.to).format(endDateFormat)
            break;
        default: {
            store.from = null
            store.to = null
        }
    }
}