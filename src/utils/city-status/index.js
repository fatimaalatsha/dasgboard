import { Auth } from 'aws-amplify'// Import Auth from aws-amplify
import API from '../../api/BaseUrl' // Import API base URL
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
        message.success('new city created successfully');
      }
    }
    catch (error) {
      console.log(error)
    }  
  }
  
  
export { createCity }