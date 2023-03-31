import { Auth } from 'aws-amplify'// Import Auth from aws-amplify
import API from '../../api/BaseUrl' // Import API base URL
import NEW_API from '../../api/NewUrl'// Import API base url

const deleteDriver = async (driverId) => {
    try {
        const auth = await Auth.currentSession()// Get current session
        const token = auth.getAccessToken().getJwtToken()// Get token from session
        const options = { // Set options for endpoint
            headers: {
                'Authorization': token,
                ...(process.env.REACT_APP_ENV && {'env': process.env.REACT_APP_ENV}),
            }
        }
        const response = await API.delete(`/v1/drivers/cc/${driverId}`, options)
        const data = await response.data
        if(data) {
            return data.success
        }
    } catch (error) {
        console.log(error)
        return false
    }
}

const updateStatus = async (status, driverId) => {
    try {
      const auth = await Auth.currentSession()// Get current session
      const token = auth.getAccessToken().getJwtToken()// Get token from session
      const options = { // Set options for fetch
          headers: {
              'Authorization': token,
              ...(process.env.REACT_APP_ENV && {'env': process.env.REACT_APP_ENV}),
          }
      }
      const body = {'status': status}
      const response = await API.post(`/v1/drivers/cc/${driverId}/status`, body, options)
      const data = await response.data
      return data
    } catch (error) {
        console.log(error)
        return false
    }
}

const updateApplicationStatus = async (driverId,applicationStatus,statusReason = null) => {
    try {
        const auth = await Auth.currentSession()// Get current session
        const token = auth.getAccessToken().getJwtToken()// Get token from session
        const options = { // Set options for fetch
            headers: {
                'Authorization': token,
                ...(process.env.REACT_APP_ENV && { 'env': process.env.REACT_APP_ENV }),
            }
        }
        const body = {
        'application_status': applicationStatus,
        'status_reason': statusReason || ''
        }
        const response = await API.put(`/v1/drivers/cc/${driverId}`, body, options)
        const data = await response.data
        return data
    } catch (error) {
        console.log(error)
        return false
    }
}

const notifyDriver = async (driverId, body) => {
    try {
        const auth = await Auth.currentSession()// Get current session
        const token = auth.getAccessToken().getJwtToken()// Get token from session
        const options = { // Set options for endpoint
            headers: {
                'Authorization': token,
                ...(process.env.REACT_APP_ENV && {'env': process.env.REACT_APP_ENV}),
            }
        }
      const response = await API.post(`/v1/drivers/cc/${driverId}/notify-documents`, { ...(body.message && body) }, options)
      const data = await response.data
      return data
    } catch (error) {
        console.log(error)
        return false
    }
}

const updateDriver = async (driverId, body) => { // Update driver details
    try {
        const auth = await Auth.currentSession()// Get current session
        const token = auth.getAccessToken().getJwtToken()// Get token from session
        const options = { // Set options for endpoint
            headers: {
                'Authorization': token,
                ...(process.env.REACT_APP_ENV && {'env': process.env.REACT_APP_ENV}),
            }
        }
        const response = await API.put(`/v1/drivers/cc/${driverId}`, body, options)
        const data = await response.data
        return data
    } catch (error) {
        console.log(error)
        return false
    }
}

const createDriverNotes = async (driverId, body) => { // Create driver notes
    try {
        const auth = await Auth.currentSession()// Get current session
        const token = auth.getAccessToken().getJwtToken()// Get token from session
        const options = { // Set options for endpoint
            headers: {
                'Authorization': token,
                ...(process.env.REACT_APP_NEW_ENV && {'env': process.env.REACT_APP_NEW_ENV}),
            }
        }
        const response = await NEW_API.post(`/v1/drivers/${driverId}/notes`, body, options)
        const data = await response.data
        return data
    } catch (error) {
        console.log(error)
        return false
    }
}

const archiveDriverNotes = async (noteId) => { // Archive driver notes
    try {
        const auth = await Auth.currentSession()// Get current session
        const token = auth.getAccessToken().getJwtToken()// Get token from session
        const options = { // Set options for endpoint
            headers: {
                'Authorization': token,
                ...(process.env.REACT_APP_NEW_ENV && {'env': process.env.REACT_APP_NEW_ENV}),
            }
        }
        const response = await NEW_API.post(`/v1/drivers/notes/${noteId}/archive`, {}, options)
        const data = await response.data
        return data
    } catch (error) {
        console.log(error)
        return false
    }
}

export { deleteDriver, updateStatus, notifyDriver, updateApplicationStatus, updateDriver, createDriverNotes, archiveDriverNotes }