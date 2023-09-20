import { Auth } from "aws-amplify" // Amplify Auth manager
import API from '../../api/NewUrl' // Axios Instance

const createTraining = async (payload) => {
    try {
        const auth = await Auth.currentSession()// Get current session
        const token = auth.getAccessToken().getJwtToken()// Get token from session
        const options = { // Set options for endpoint
          headers: {
            'Authorization': token,
            ...(process.env.REACT_APP_NEW_ENV && {'env': process.env.REACT_APP_NEW_ENV}),
          },
        }
        const response = await API.post(`/v1/trainings`, {...payload}, options)
        const data = await response.data
        return data
    } catch (error) {
        console.log(error)
        return false
    }

}

const deleteTraining = async (training_id) => {
    try {
        const auth = await Auth.currentSession()// Get current session
        const token = auth.getAccessToken().getJwtToken()// Get token from session
        const options = { // Set options for endpoint
          headers: {
            'Authorization': token,
            ...(process.env.REACT_APP_NEW_ENV && {'env': process.env.REACT_APP_NEW_ENV}),
          },
        }
        const response = await API.delete(`/v1/trainings/${training_id}`, options)
        const data = await response.data
        return data
    } catch (error) {
        console.log(error)
        return false
    }
}

const updateTraining = async (payload, training_id) => {
  try {
      const auth = await Auth.currentSession()// Get current session
      const token = auth.getAccessToken().getJwtToken()// Get token from session
      const options = { // Set options for endpoint
        headers: {
          'Authorization': token,
          ...(process.env.REACT_APP_NEW_ENV && {'env': process.env.REACT_APP_NEW_ENV}),
        },
      }
      const response = await API.put(`/v1/trainings/${training_id}`, {...payload} ,options)
      const data = await response.data
      return data
  } catch (error) {
      console.log(error)
      return false
  }

}

export { createTraining, deleteTraining, updateTraining }