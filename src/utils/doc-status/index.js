import { Auth } from 'aws-amplify'// Import Auth from aws-amplify
import API from '../../api/BaseUrl' // Import API base URL

const isAllApproved = async (driverId) => {
  /* const { approvals } = doc
  return approvals.every((approval) => approval.status === 'approved') */
  try {
    const auth = await Auth.currentSession()// Get current session
    const token = auth.getAccessToken().getJwtToken()// Get token from session
    const options = { // Set options for fetch
        headers: {
            'Authorization': token,
            ...(process.env.REACT_APP_ENV && {'env': process.env.REACT_APP_ENV}),
        }
    }
    const listResponse = await API.get(`/v1/documents/cc/`, options)
    const dataList = await listResponse.data.items
    const docsResponse = await API.get(`/v1/documents/cc/drivers/${driverId}`, options)
    const docArray = await docsResponse.data.items
    if(dataList && docArray) {
      const mergedArray = dataList.map(data => ({
        ...data,
        ...docArray.find(doc => doc.document.name === data.name)
      }))
        //console.log(mergedArray)
        const isReady = mergedArray.every((doc) => doc.status === 'approved')
        //console.log(isReady)
        return isReady
    }
    return false
  } catch (error) {
      console.log(error)
      return false
  }
}

export { isAllApproved }