import { useState } from 'react'
import { Button, Card, Descriptions, Divider } from 'antd'
import { useParams } from 'react-router-dom'

import EditableText from '../../components/EditableText' // Import Driver contact information component
import DriverDocument from '../../components/DriverDocument' // Import Document viewers component
import DriverTimeline from '../../components/DriverTimeline' // Import Timeline 

import useFetch from '../../hooks/use-fetch' // Import useFetch custom hook


const DriverDetails = () => {
  const {id} = useParams(); // Get id from url
  const { data, isLoading, error } = useFetch(`/v1/drivers/cc/${id}`)// Call useFetch custom hook

  if (error) {
    return <div>Something went wrong</div>
  }

  return (
        <Card title={'Driver Details'} loading={isLoading} style={{ margin: 15 }} >
          <Descriptions 
            labelStyle={{ fontWeight:'bold' }} 
            title={`${data.first_name} ${data.last_name}`}
          >
              <Descriptions.Item label="First Name">
                <EditableText text={data.first_name} />
              </Descriptions.Item>
              <Descriptions.Item label="Last Name">
                <EditableText text={data.last_name} />
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                <EditableText text={data.email} />
              </Descriptions.Item>
              <Descriptions.Item label="Phone Number">
                <EditableText text={data.phone} />
              </Descriptions.Item>
              <Descriptions.Item label="Licence Number">
                <EditableText text={data.license_number} />
              </Descriptions.Item>
              <Descriptions.Item label="City">
                {data.city?.name}
              </Descriptions.Item>
              <Descriptions.Item label="Address">
                <EditableText text={data.address} />
              </Descriptions.Item>
              <Descriptions.Item label="Date of Birth">
                {data.date_birth}
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
