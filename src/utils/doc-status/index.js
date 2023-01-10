import { Auth } from 'aws-amplify'// Import Auth from aws-amplify
import API from '../../api/BaseUrl' // Import API base URL

const isAllApproved = async (driverId) => {
  try {
    const auth = await Auth.currentSession()// Get current session
    const token = auth.getAccessToken().getJwtToken()// Get token from session
    const options = { // Set options for endpoint
        headers: {
            'Authorization': token,
            ...(process.env.REACT_APP_ENV && {'env': process.env.REACT_APP_ENV}),
        }
    }
    const response = await API.post(`/v1/drivers/cc/${driverId}/activate`, {}, options)
    const data = await response.data
    return data
  } catch (error) {
      //console.log(error)
      return false
  }
}

const deleteAdditionalDoc = async (docId) => {
  try {
    const auth = await Auth.currentSession()// Get current session
    const token = auth.getAccessToken().getJwtToken()// Get token from session
    const options = { // Set options for endpoint
        headers: {
            'Authorization': token,
            ...(process.env.REACT_APP_ENV && {'env': process.env.REACT_APP_ENV}),
        }
    }
    const response = await API.delete(`/v1/documents/cc/additional/${docId}`, options)
    const data = await response.data
    return data.success
  } catch {
    return false
  }
}

const enableAdditionalDocs = async (driverId) => {
  try {
    const auth = await Auth.currentSession()// Get current session
    const token = auth.getAccessToken().getJwtToken()// Get token from session
    const options = { // Set options for endpoint
        headers: {
            'Authorization': token,
            ...(process.env.REACT_APP_ENV && {'env': process.env.REACT_APP_ENV}),
        }
    }
    const response = await API.post(`/v1/documents/cc/additional/${driverId}/enable/`, {}, options)
    const data = await response.data
    return data.success
  } catch (error) {
      return false
  }
}

const disableAdditionalDocs = async (driverId) => {
  try {
    const auth = await Auth.currentSession()// Get current session
    const token = auth.getAccessToken().getJwtToken()// Get token from session
    const options = { // Set options for endpoint
        headers: {
            'Authorization': token,
            ...(process.env.REACT_APP_ENV && {'env': process.env.REACT_APP_ENV}),
        }
    }
    const response = await API.post(`/v1/documents/cc/additional/${driverId}/disable/`, {}, options)
    const data = await response.data
    return data.success
  } catch (error) {
      return false
  }
}

export { isAllApproved, deleteAdditionalDoc, enableAdditionalDocs, disableAdditionalDocs }