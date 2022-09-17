import { useState} from 'react'
import { Card, Descriptions, Divider, PageHeader, Button, Tag, Modal, Typography, Space } from 'antd'
import { useParams } from 'react-router-dom'
import { Auth } from 'aws-amplify'// Import Amplify auth method
import API from '../../api/BaseUrl' // Import API base URL


import EditableText from '../../components/EditableText' // Import editbale string component
import EditableDate from '../../components/EditableDate' // Import editable date component
import EditableSelect from '../../components/EditableSelect' // Import editable select component
import DriverDocument from '../../components/DriverDocument' // Import Document viewers component
import DriverTimeline from '../../components/DriverTimeline' // Import Timeline 

import useFetch from '../../hooks/use-fetch' // Import useFetch custom hook

const { confirm } = Modal // Destructure config from Modal
const { Title, Text } = Typography // Destructure Title from Typography

const SelectFeeder = (props) => {
  const { data, isLoading, error } = useFetch(`/v1/cities`)// Call useFetch custom hook

  if (isLoading) {
    return <>Loading...</>
  }
  
  if (error) {
    return <>Something went wrong</>
  }
  
  return (
    <>
      <EditableSelect updateCallback={props.updateCallback} value={props.value} options={data.items} name="city_id" />
    </>
  )
}


const DriverDetails = () => {
  const {id} = useParams(); // Get id from url
  const { data, isLoading, error, refetch } = useFetch(`/v1/drivers/cc/${id}`)// Call useFetch custom hook
  const [loading, setLoading] = useState(false)// Set loading state

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

  const updateStatus = async (status) => {
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
      const response = await API.post(`/v1/drivers/cc/${id}/status`, body, options)
      const data = await response.data
      if(data) {
          //console.log(data)
          refetch() // Refetch data
      }
    } catch (error) {
        console.log(error)
    }
  }

  const showConfirm = (status) => {
    setLoading(true)
    confirm({
      title: 
          <Title level={4}>
            {`Are you sure you want to change the status to `}
            <Text style={{ textTransform: 'capitalize'}} mark strong>{status}?</Text>
          </Title>,
      content: 'This action cannot be undone',
      onOk: async () => {
        await updateStatus(status)
        .then(() => {
          setLoading(false)
        })
      },
      onCancel() {
        setLoading(false)
        console.log('Cancel');
      },
    });
  }

  if (error) {
    return <div>Something went wrong</div>
  }
  
  return (
        <Card title={'Driver Details'} loading={isLoading} style={{ margin: 15 }} >
          <PageHeader
            ghost={false}
            onBack={() => window.history.back()}
            title={`${data.first_name} ${data.last_name}`}
            tags={
              <Tag style={{ textTransform: 'capitalize'}} 
                color={data.status === 'active' ? 'success' : data.status === 'inactive' ? 'error' : 'warning'}
              >
                {data.status}
              </Tag>
            }
            extra={[
              <Button 
                loading={loading} 
                key="2" 
                danger 
                onClick={() => showConfirm('inactive')}
                disabled={data.status === 'inactive' || data.status === 'pending' || data.status === 'onboard'}
              >
                Deactivate
              </Button>,
              <Button 
                loading={loading} 
                key="1" 
                type="primary" 
                onClick={() => showConfirm('active')}
                disabled={data.status === 'active' || data.status === 'onboard'}
              >
                Activate Driver
              </Button>,
            ]}
          >
          <Descriptions labelStyle={{ fontWeight:'bold' }}  >
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
                <SelectFeeder value={data.city?.name} updateCallback={updateText} />
              </Descriptions.Item>
              <Descriptions.Item label="Address">
                <EditableText name='address' value={data.address} updateCallback={updateText} />
              </Descriptions.Item>
              <Descriptions.Item label="Date of Birth">
                <EditableDate name='birth_date' value={data.date_birth} updateCallback={updateText} />
              </Descriptions.Item>
          </Descriptions>
          </PageHeader>
          <Divider orientation="left"><h3>Driver Documents</h3></Divider>
           <DriverDocument id={id} sub={data.sub_id} />
           <Divider orientation="left"><h3>Driver History</h3></Divider>
           <DriverTimeline id={id}/>
        </Card>
  )
};

export default DriverDetails;
