const meta = {
	"page": {
			"total": 1,
			"lastPage": 1,
			"perPage": "10",
			"currentPage": 1
	}
}

function findByStatusId(id, page){

	if(page == 1){
		return {data: [{
				id, 
				title: 'Card in status ' + id,
		}], meta}
	}

	return {data: [], 
		meta: {
				"page": {
						"total": 0,
						"lastPage": 1,
						"perPage": "10",
						"currentPage": 2
				}
		}
	}
}

export default {
	findByStatusId
}
