import { Button, Card, Descriptions, Divider, Modal, Timeline } from 'antd';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import API from '../../api/BaseUrl';
import DriverDocument from '../../components/DriverDocument';
import DriverTimeline from '../../components/DriverTimeline';


const DriverDetails = () => {
  const {id} = useParams();
  const [userInfo, setUserInfo] = useState({})
  const [userDocuments, setUserDocuments] = useState([])
  const [userCity, setUserCity] = useState()
  const [loading, setLoading] = useState(true);
  const options = {
    headers: {
        'Authorization': 'accessToken'
    }
  }

  useEffect(() => {
    getUserInfo(id)
    getUserDocuments(id)
  }, []);

  const getUserInfo = async (id) => {
    setLoading(true)
    
    await API.get(`/v1/drivers/cc/${id}`, options).then(response => {
      setUserInfo(response.data)
      if (response.data.city){
      setUserCity(response.data.city.name)
      }
      console.log(response.data)
      setLoading(false)
    })
  };

  const onDeleteDriver = async () => {
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
  }

  const getUserDocuments = async (id) => {
    setLoading(true)

    await API.get(`/v1/documents/cc/drivers/${id}`, options).then(response => {
      setUserDocuments(response.data.items)
      console.log(response.data.items)
      setLoading(false)
    })
  };

  return(
        <Card title={'Driver Details'}  loading={loading} style={{ margin: 15 }} >
          <Descriptions 
            labelStyle={{ fontWeight:'bold' }} 
            title={`${userInfo.first_name} ${userInfo.last_name}`} 
            extra={
              <>
              <Button type="primary" style={{ marginRight: 15 }}>
                Edit
              </Button>
              <Button type="danger" onClick={() => {onDeleteDriver()}} style={{ marginRight: 15 }}>
              Delete Driver
            </Button>
            </>
            }>
              <Descriptions.Item label="First Name">{userInfo.first_name}</Descriptions.Item>
              <Descriptions.Item label="Last Name">{userInfo.last_name}</Descriptions.Item>
              <Descriptions.Item label="Email">{userInfo.email}</Descriptions.Item>
              <Descriptions.Item label="Date of Birth">{userInfo.date_birth}</Descriptions.Item>
              <Descriptions.Item label="City">{userCity}</Descriptions.Item>
              <Descriptions.Item label="Address">{userInfo.address}</Descriptions.Item>
          </Descriptions>
          <Divider orientation="left"><h3>Driver Documents</h3></Divider>
            {
              userDocuments.map((item) => (
                <DriverDocument key={item.id} document={item} userPrefix={userInfo.prefix}/>
              ))
            }
           <Divider orientation="left"><h3>Driver History</h3></Divider>
           <DriverTimeline key={id} id={id}/>
        </Card>
  )
};

export default DriverDetails;
