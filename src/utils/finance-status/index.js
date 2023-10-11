import { Auth } from "aws-amplify"; // Import Auth from aws-amplify
import NEW_API from "../../api/NewUrl"; // Import API base url


// create a bonus function
const createBonus = async (values) => {
       try {
      const auth = await Auth.currentSession()// Get current session
      const token = auth.getAccessToken().getJwtToken()// Get token from session
      const options = { // Set options for fetch
          headers: {
              'Authorization': token,
                ...(process.env.REACT_APP_NEW_ENV && { 'env': process.env.REACT_APP_NEW_ENV }),
            }
        }
        const body = {
            'name': values.name,
            'city_id': values.city_id,
            'type': values.type,
            'status': values.status,
            'goal': values.goal,
            'start_time': values.start_time,
            'end_time': values.end_time,
            'payout': values.payout,
            'objective': values.objective,
        }
        const response = await NEW_API.post(`/v1/bonuses`, body, options)
        const data = await response.data
        return data
    } catch (error) {
        console.log(error)
        return false
    }
}



//delete bonus function
const deleteBonus = async (id) => {
    try {
        
        const auth = await Auth.currentSession() // Get current session
        const token = auth.getAccessToken().getJwtToken() // Get token from session
        const options = { // Set options for fetch
            headers: {
                'Authorization': token,
                ...(process.env.REACT_APP_NEW_ENV && { 'env': process.env.REACT_APP_NEW_ENV }),
            }
        }
        const response = await NEW_API.delete(`/v1/bonuses/${id}`, options)
        const data = await response.data
        console.log(data)
        //show success message
        return data
    } catch (error) {
        console.log(error)
        return false
    }
}

//edit bonus function
const editBonus = async (id, values) => {
    try {
        const auth = await Auth.currentSession() // Get current session
        const token = auth.getAccessToken().getJwtToken() // Get token from session
        const options = { // Set options for fetch
            headers: {
                'Authorization': token,
                ...(process.env.REACT_APP_NEW_ENV && { 'env': process.env.REACT_APP_NEW_ENV }),
            }
        }
        const body = {
            'name': values.name,
            'city_id': values.city_id,
            'type': values.type,
            'status': values.status,
            'goal': values.goal,
            'start_time': values.start_time,
            'end_time': values.end_time,
            'payout': values.payout,
            'objective': values.objective,
        }
        const response = await NEW_API.put(`/v1/bonuses/${id}`, body, options)
        const data = await response.data
        console.log(data)
        return data
    }
    catch (error) {
        console.log(error)
        return false
    }
}

export { createBonus, deleteBonus, editBonus };
          
