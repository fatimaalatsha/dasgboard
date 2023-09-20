import { Auth } from 'aws-amplify'// Import Amplify auth method
import API from '../../api/NewUrl' // Import API base URL

import useFetch from '../../hooks/use-new-fetch'// Import useFetch custom hook
import Document from '../Document' // Import Document component

const DriverDocument = ({ id, sub }) => {
  const { data, isLoading, error, refetch } = useFetch(`/v1/documents/drivers/${id}`)// Call useFetch custom hook

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error...</div>
  }

  const updateText = async (newValue, type, documentId) => {
    try {
        const auth = await Auth.currentSession()// Get current session
        const token = auth.getAccessToken().getJwtToken()// Get token from session
        const options = { // Set options for fetch
            headers: {
                'Authorization': token,
                ...(process.env.REACT_APP_NEW_ENV && {'env': process.env.REACT_APP_NEW_ENV}),
            }
        }
        const body = {
          ['type']: type,
          ...newValue,
        }
        const response = await API.put(`/v1/documents/${documentId}`, body, options)
        const data = await response.data
        if(data) {
            return data
        }
    } catch (error) {
        console.log(error)
    }
}

  return (
    <>
    {
      data.items.map((item, index) => (
        <Document key={index} data={item} sub={sub} updateText={updateText} refetch={refetch} />
      ))
    }
    </>
  )

}

export default DriverDocument