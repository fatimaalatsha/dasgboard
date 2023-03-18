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

const readyToDrive = async (driverId) => {
  try {
    const auth = await Auth.currentSession()// Get current session
    const token = auth.getAccessToken().getJwtToken()// Get token from session
    const options = { // Set options for endpoint
        headers: {
            'Authorization': token,
            ...(process.env.REACT_APP_ENV && {'env': process.env.REACT_APP_ENV}),
        }
    }
    const response = await API.post(`/v1/drivers/cc/${driverId}/ready-email`, {}, options)
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

const updatePinkSlipStatus = async (driverId, setPinkSlipStatus) => {
  try {
    const auth = await Auth.currentSession()// Get current session
    const token = auth.getAccessToken().getJwtToken()// Get token from session
    const options = { // Set options for endpoint
      headers: {
        'Authorization': token,
        ...(process.env.REACT_APP_ENV && { 'env': process.env.REACT_APP_ENV }),
      },
    }
    const body = {'pink_slip': true}
    const response = await API.put(`/v1/drivers/cc/${driverId}`, body, options)
    const data = await response.data
    setPinkSlipStatus(true) // Update the state of the variable
    return data
  } catch (error) {
    //console.log(error)
    return false
  }
}


          

export { isAllApproved, deleteAdditionalDoc, enableAdditionalDocs, disableAdditionalDocs, readyToDrive, updatePinkSlipStatus }