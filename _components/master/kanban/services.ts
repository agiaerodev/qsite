import baseService from 'modules/qcrud/_services/baseService'

export default {
  /* Columns */
  getColumns(apiRoute = '', params = {}, refresh = false): Promise<any> {    
    return new Promise((resolve, reject) => {
      const requestParams = {refresh, params}
      //Request
      baseService.index(apiRoute, requestParams).then(response => {
        resolve(response)
      }).catch(error => reject(error))
    })
  }, 

  createColumn(apiRoute = '', data = {}, params = {}): Promise<any> {    
    return new Promise((resolve, reject) => {      
      //Request
      baseService.create(apiRoute, data, params).then(response => {
        resolve(response)
      }).catch(error => reject(error))
    })
  }, 

  updateColumn(apiRoute = '', colmunId, params = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      //Request
      baseService.update(apiRoute, colmunId, params).then(response => {
        resolve(response)
      }).catch(error => reject(error))
    })
  },

  deleteColumn(apiRoute = '', colmunId, params = {}): Promise<any> {
    return new Promise((resolve, reject) => {      
      //Request      
      baseService.delete(apiRoute, colmunId, params).then(response => {
        resolve(response)
      }).catch(error => reject(error))
    })
  },

  orderColumns(apiRoute = '', data = {}): Promise<any> {    

    return new Promise((resolve, reject) => {      
      //Request
      const body = {
        attributes: data
      }
      baseService.put(apiRoute, body).then(response => {
        resolve(response)
      }).catch(error => reject(error))
    })
  }, 


  /* cards */
  getCards(apiRoute = '', params = {}, refresh = false): Promise<any> {    
    return new Promise((resolve, reject) => {
      const requestParams = {refresh, params}      
      //Request
      baseService.index(apiRoute, requestParams).then(response => {
        resolve(response)
      }).catch(error => reject(error))
    })
  }, 

  createCard(apiRoute = '', data = {}, params = {}): Promise<any> {    
    return new Promise((resolve, reject) => {      
      //Request
      baseService.create(apiRoute, data, params).then(response => {
        resolve(response)
      }).catch(error => reject(error))
    })
  }, 

  updateCard(apiRoute = '', cardId, params = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      //Request
      baseService.update(apiRoute, cardId, params).then(response => {
        resolve(response)
      }).catch(error => reject(error))
    })
  },

  deleteCard(apiRoute = '', cardId, params = {}): Promise<any> {
    return new Promise((resolve, reject) => {      
      //Request      
      baseService.delete(apiRoute, cardId, params).then(response => {
        resolve(response)
      }).catch(error => reject(error))
    })
  }


}
