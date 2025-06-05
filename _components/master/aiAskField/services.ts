import baseService from 'modules/qcrud/_services/baseService'

export default {
  async getResponseAI(api, prompt): Promise<any> {
    try {
      const { data } = await baseService.create(api, { prompt })
      return data
    } catch (error) {
      console.error(error)
    }
  },
}
