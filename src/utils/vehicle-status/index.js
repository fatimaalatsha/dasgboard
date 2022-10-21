import { Auth } from 'aws-amplify'// Import Auth from aws-amplify
import API from '../../api/BaseUrl' // Import API base URL

const createVehicle = async (payload) => {
    try {
        const auth = await Auth.currentSession()// Get current session
        const token = auth.getAccessToken().getJwtToken()// Get token from session
        const options = { // Set options for endpoint
            headers: {
                'Authorization': token,
                ...(process.env.REACT_APP_ENV && {'env': process.env.REACT_APP_ENV}),
            }
        }
        const response = await API.post(`/v1/vehicles/cc`, payload, options)
        return response
    } catch (error) {
        console.log(error)
        return false
    }
}

const deleteVehicle = async (vehicleId) => {
    try {
        const auth = await Auth.currentSession()// Get current session
        const token = auth.getAccessToken().getJwtToken()// Get token from session
        const options = { // Set options for endpoint
            headers: {
                'Authorization': token,
                ...(process.env.REACT_APP_ENV && {'env': process.env.REACT_APP_ENV}),
            }
        }
        const response = await API.delete(`/v1/vehicles/cc/${vehicleId}`, options)
        return response
    } catch (error) {
        console.log(error)
        return false
    }
}

const updateVehicle = async (payload, id) => {
    try {
        const auth = await Auth.currentSession()// Get current session
        const token = auth.getAccessToken().getJwtToken()// Get token from session
        const options = { // Set options for endpoint
            headers: {
                'Authorization': token,
                ...(process.env.REACT_APP_ENV && {'env': process.env.REACT_APP_ENV}),
            }
        }
        const body = payload
        const response = await API.put(`/v1/vehicles/cc/${id}`, body, options)
        return response
    } catch (error) {
        console.log(error)
        return false
    }
}

export { createVehicle, deleteVehicle, updateVehicle }