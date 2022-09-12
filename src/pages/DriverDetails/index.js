import { useState } from 'react'
import { Button, Card, Descriptions, Divider } from 'antd'
import { useParams } from 'react-router-dom'
import { Auth } from 'aws-amplify'// Import Amplify auth method
import API from '../../api/BaseUrl' // Import API base URL


import EditableText from '../../components/EditableText' // Import editbale string component
import EditableDate from '../../components/EditableDate' // Import editable date component
import DriverDocument from '../../components/DriverDocument' // Import Document viewers component
import DriverTimeline from '../../components/DriverTimeline' // Import Timeline 

import useFetch from '../../hooks/use-fetch' // Import useFetch custom hook


const DriverDetails = () => {
  const {id} = useParams(); // Get id from url
  const { data, isLoading, error, refetch } = useFetch(`/v1/drivers/cc/${id}`)// Call useFetch custom hook

  const updateText = async (payload) => {
    try {
        const auth = await Auth.currentSession()// Get current session
        const token = auth.getAccessToken().getJwtToken()// Get token from session
        const options = { // Set options for fetch
            headers: {
                'Authorization': token,
                ...(process.env.REACT_APP_ENV && {'env': process.env.REACT_APP_ENV}),
            }
        }
        const body = payload
        console.log(body)
        const response = await API.put(`/v1/drivers/cc/${id}`, body, options)
        const data = await response.data
        if(data) {
            console.log(data)
            refetch() // Refetch data
        }
    } catch (error) {
        console.log(error)
    }
}

  if (error) {
    return <div>Something went wrong</div>
  }

  //console.log(data)

  return (
        <Card title={'Driver Details'} loading={isLoading} style={{ margin: 15 }} >
          <Descriptions 
            labelStyle={{ fontWeight:'bold' }} 
            title={`${data.first_name} ${data.last_name}`}
          >
              <Descriptions.Item label="First Name">
                <EditableText name='first_name' value={data.first_name} updateCallback={updateText} />
              </Descriptions.Item>
              <Descriptions.Item label="Last Name">
                <EditableText name='last_name' value={data.last_name} updateCallback={updateText} />
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                <EditableText name='email' value={data.email} updateCallback={updateText} />
              </Descriptions.Item>
              <Descriptions.Item label="Phone Number">
                <EditableText name='phone' value={data.phone} updateCallback={updateText} />
              </Descriptions.Item>
              <Descriptions.Item label="Licence Number">
                <EditableText name='license_number' value={data.license_number} updateCallback={updateText} />
              </Descriptions.Item>
              <Descriptions.Item label="City">
                {data.city?.name}
              </Descriptions.Item>
              <Descriptions.Item label="Address">
                <EditableText name='address' value={data.address} updateCallback={updateText} />
              </Descriptions.Item>
              <Descriptions.Item label="Date of Birth">
                <EditableDate name='date_birth' value={data.date_birth} updateCallback={updateText} />
              </Descriptions.Item>
          </Descriptions>
          <Divider orientation="left"><h3>Driver Documents</h3></Divider>
           <DriverDocument id={id} sub={data.sub_id} />
           <Divider orientation="left"><h3>Driver History</h3></Divider>
           <DriverTimeline id={id}/>
        </Card>
  )
};

export default DriverDetails;
