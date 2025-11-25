import moment from 'moment';
import {reactive, computed} from 'vue';
import { startDateFormat, endDateFormat } from 'modules/qsite/_components/master/kanban/constants/constants';

const state = reactive({
    showModal: false,
    chartsData: null,
    loading: false,
    filterDate: 'currentMonth',
    from: moment().startOf('month').format(startDateFormat),
    to: moment().endOf('month').format(endDateFormat),
    categoryId: 0,
});

const store = computed(() => ({
    get showModal(): boolean {
        return state.showModal;
    },
    set showModal(value: boolean) {
        state.showModal = value;
    },
    get filterDate(): any {
        return state.filterDate;
    },
    set filterDate(value: any) {
        state.filterDate = value;
    },
    get from(): any {
        return state.from;
    },
    set from(value: any) {
        state.from = value;
    },
    get to(): any {
        return state.to;
    },
    set to(value: any) {
        state.to = value;
    },
    get chartsData(): any {
        return state.chartsData;
    },
    set chartsData(value: any) {
        state.chartsData = value;
    },
    get loading(): boolean {
        return state.loading;
    },
    set loading(value: boolean) {
        state.loading = value;
    },
    get categoryId(): number {
        return state.categoryId;
    },
    set categoryId(value: number) {
        state.categoryId = value;
    },
    reset() {
        state.loading = false;
        state.chartsData = null;
        state.showModal = false;
        state.categoryId = 0;
        state.filterDate = 'currentMonth';
        state.from = moment().startOf('month').format(startDateFormat);
        state.to = moment().endOf('month').format(endDateFormat);
    }
})).value;

export default store;