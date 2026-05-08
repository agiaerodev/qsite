
import { alert, i18n } from 'src/plugins/utils.ts'
import _ from 'lodash';
import baseService from 'modules/qcrud/_services/baseService.js';

function deepCamelCase(obj) {
	if (_.isArray(obj)) {
		return obj.map((v) => deepCamelCase(v));
	} else if (_.isPlainObject(obj)) {
	return _.reduce(
		obj,
		(result, value, key) => {
		result[_.camelCase(key)] = deepCamelCase(value);
		return result;
		},
		{}
	);
	}
	return obj;
}


export const getDynamicCrud = async (key = null, refresh = false) => {	
	let filters = {}

	if(key){
		const params = {
			refresh,
			params: {
				filter: { field: 'key' },
			},
		};

		const response = await baseService.show(
			'apiRoutes.qsite.cruds',
			key,
			params
		);
		
		
		if(response?.data){
			filters = response.data.filters || {};		
			filters = deepCamelCase(filters)
		}
	}

	return {
		filters
	}
}

