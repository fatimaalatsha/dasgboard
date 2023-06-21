import { Auth } from 'aws-amplify'// Import Auth from aws-amplify
import NewAPI from '../../api/NewUrl' // Import new API base URL

const createCity = async (values) => { // Create New City
    try {
      const auth = await Auth.currentSession()// Get current session
      const token = auth.getAccessToken().getJwtToken()// Get token from session
      const options = { // Set options for fetch
        headers: {
          Authorization: token,
          ...(process.env.REACT_APP_NEW_ENV && { 'env': process.env.REACT_APP_NEW_ENV }),
        }
      
      }
      const response = await NewAPI.post(`/v1/cities`, values, options)
      const data = await response.data
      return data
    } catch (error) {
      console.log(error)
    }  
}
  
const getProvince = async () => {// Get Province List for dropdown
    try {
      const auth = await Auth.currentSession()// Get current session
      const token = auth.getAccessToken().getJwtToken()// Get token from session
      const options = { // Set options for fetch
        headers: {
          Authorization: token,
          ...(process.env.REACT_APP_NEW_ENV && { 'env': process.env.REACT_APP_NEW_ENV }),
        }
      
      }
      const response = await NewAPI.get(`/v1/provinces?paginated=false`, options) // set paginated to false to get all provinces without pagination
      const data = await response.data
      const provinces = data.data.map((province) => {
        province.text = province.name
        province.value = province.id
        return province
      })
      return provinces
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

const getCities = async () => { // Get Cities List for dropdown
  try { 
    const auth = await Auth.currentSession()// Get current session
    const token = auth.getAccessToken().getJwtToken()// Get token from session
    const options = { // Set options for fetch
      headers: {
        Authorization: token,
        ...(process.env.REACT_APP_NEW_ENV && { 'env': process.env.REACT_APP_NEW_ENV }),
      }
    
    }
    const response = await NewAPI.get('/v1/cities?paginated=false&filter[status]=in|active', options) // set paginated to false to get all cities without pagination and active cities only
    const data = await response.data
    const cities = data.data.map((city) => {
      city.text = city.name
      city.value = city.id
      delete city.name
      return city
    })
    return cities
  }
  catch (error) {
    console.log(error)
  }  
}

// get af cities 


const getAutoFleetCities = async () => { // Get Cities List for dropdown
 try { 
    const auth = await Auth.currentSession()// Get current session
    const token = auth.getAccessToken().getJwtToken()// Get token from session
    const options = { // Set options for fetch
      headers: {
        Authorization: token,
        ...(process.env.REACT_APP_NEW_ENV && { 'env': process.env.REACT_APP_NEW_ENV }),
      }
    
    }
    const response = await NewAPI.get("/v1/cities/af?paginated=false", options); // set paginated to false to get all cities without pagination and active cities only
   const data = await response.data
   console.log(response.data);
    const cities = data.data.map((city) => {
      city.text = city.name
      city.value = city.city_id;
      delete city.name
      return city
    })
    return cities
  }
  catch (error) {
    console.log(error)
  }  
}

  
export { createCity, getProvince, updateCityProfile, updateEmailTemplate, getCities , getAutoFleetCities}