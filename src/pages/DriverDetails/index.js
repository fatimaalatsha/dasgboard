import { Button, Card, Descriptions, Divider } from 'antd'
import { useParams } from 'react-router-dom'

import DriverDocument from '../../components/DriverDocument'
import DriverTimeline from '../../components/DriverTimeline'

import useFetch from '../../hooks/use-fetch' // Import useFetch custom hook


const DriverDetails = () => {
  const {id} = useParams();

  const { data, isLoading, error } = useFetch(`/v1/drivers/cc/${id}`)// Call useFetch custom hook

  /* const options = {
    headers: {
        'Authorization': 'usertoken',
        ...(process.env.REACT_APP_ENV && {'env': process.env.REACT_APP_ENV}),
    }
  } */

  /* const getUserInfo = async (id) => {
    setLoading(true)
    
    await API.get(`/v1/drivers/cc/${id}`, options).then(response => {
      setUserInfo(response.data)
      if (response.data.city){
      setUserCity(response.data.city.name)
      }
      console.log(response.data)
      setLoading(false)
    })
  }; */

  /* const onDeleteDriver = async () => {
    Modal.confirm({
      title: "Are you sure you want to delete this driver's record?",
      okText: "YES",
      okType: "danger",
      onOk: async () => {
        await API.delete(`/v1/drivers/${id}`, options).then(response => {
          console.log(response.data)
        })
      }
    })
  } */

  /* const getUserDocuments = async (id) => {
    setLoading(true)

    await API.get(`/v1/documents/cc/drivers/${id}`, options).then(response => {
      setUserDocuments(response.data.items)
      console.log(response.data.items)
      setLoading(false)
    })
  }; */

  if (error) {
    return <div>Something went wrong</div>
  }

  return(
        <Card title={'Driver Details'} loading={isLoading} style={{ margin: 15 }} >
          <Descriptions 
            labelStyle={{ fontWeight:'bold' }} 
            title={`${data.first_name} ${data.last_name}`} 
            extra={
              <>
              <Button type="primary" style={{ marginRight: 15 }}>
                Edit
              </Button>
              <Button type="danger" /* onClick={() => {onDeleteDriver()}} style={{ marginRight: 15 }} */>
              Delete Driver
            </Button>
            </>
            }>
              <Descriptions.Item label="First Name">{data.first_name}</Descriptions.Item>
              <Descriptions.Item label="Last Name">{data.last_name}</Descriptions.Item>
              <Descriptions.Item label="Email">{data.email}</Descriptions.Item>
              <Descriptions.Item label="Date of Birth">{data.date_birth}</Descriptions.Item>
              <Descriptions.Item label="City">{data.city?.name}</Descriptions.Item>
              <Descriptions.Item label="Address">{data.address}</Descriptions.Item>
          </Descriptions>
          <Divider orientation="left"><h3>Driver Documents</h3></Divider>
           <DriverDocument id={id} sub={data.sub_id} />
           <Divider orientation="left"><h3>Driver History</h3></Divider>
           <DriverTimeline id={id}/>
        </Card>
  )
};

export default DriverDetails;
