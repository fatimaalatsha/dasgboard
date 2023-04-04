import { Auth } from 'aws-amplify'// Import Auth from aws-amplify
import API from '../../api/BaseUrl' // Import API base URL
import NewAPI from '../../api/NewUrl'
import  { message }  from 'antd'

//
const createCity = async (values) => {
    try {
      const auth = await Auth.currentSession()// Get current session
      const token = auth.getAccessToken().getJwtToken()// Get token from session
      const options = { // Set options for fetch
        headers: {
          Authorization: token,
          ...(process.env.REACT_APP_ENV && { 'env': process.env.REACT_APP_ENV }),
        }
      
      }
      const response = await API.post(`/v1/cities/cc`, values, options)
      const data = await response.data
      if (data) {
        message.success('City created successfully');
      }
    }
    catch (error) {
      console.log(error)
    }  
  }
  
 // Fetch getProvince list from API

  const getProvince = async () => {
    try {
      const auth = await Auth.currentSession()// Get current session
      const token = auth.getAccessToken().getJwtToken()// Get token from session
      const options = { // Set options for fetch
        headers: {
          Authorization: token,
          ...(process.env.REACT_APP_ENV && { 'env': process.env.REACT_APP_ENV }),
        }
      
      }
      const response = await API.get(`/v1/provinces`, options)
      const data = await response.data
      console.log('data', data)
      if (data) {
        const provinces = data.items.map((province) => {
          province.value = province.province_id
          return province;
        })
      }
    }
    catch (error) {
      console.log(error)
    }  
}

const updateCityProfile = async (id, property) => {
    try {
      const auth = await Auth.currentSession()// Get current session
      const token = auth.getAccessToken().getJwtToken()// Get token from session
      const options = { // Set options for fetch
        headers: {
          Authorization: token,
          ...(process.env.REACT_APP_NEW_ENV && { 'env': process.env.REACT_APP_NEW_ENV }),
        }
      }
      const response = await NewAPI.put(`/v1/cities/${id}`, property, options)
      const data = await response.data
      if (data) {
        return data
      }
    }
    catch (error) {
      console.log(error)
    }  
}

const updateEmailTemplate = async (id, payload) => {
    try {
      const auth = await Auth.currentSession()// Get current session
      const token = auth.getAccessToken().getJwtToken()// Get token from session
      const options = { // Set options for fetch
        headers: {
          Authorization: token,
          ...(process.env.REACT_APP_NEW_ENV && { 'env': process.env.REACT_APP_NEW_ENV }),
        }
      }
      const body = {
        city_id: Number(id),
        ...payload
      }
      const response = await NewAPI.post(`/v1/cities/${id}/settings`, body, options)
      const data = await response.data
      if (data) {
        return data.message
      }
    }
    catch (error) {
      console.log(error)
    }
}

  
export { createCity, getProvince, updateCityProfile, updateEmailTemplate }