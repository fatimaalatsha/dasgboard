import { useState } from 'react'
import { PageHeader } from '@ant-design/pro-layout';
import { 
  Card, 
  Descriptions, 
  Divider, 
  Button, 
  Tag, 
  Modal, 
  Typography, 
  Space,
  Tooltip, 
  message,
  Table,
  Form,
  Input,
} from 'antd' // Import antd components
import { SendOutlined} from '@ant-design/icons' // Import icon
import { useParams, useNavigate } from 'react-router-dom'
import { Auth } from 'aws-amplify'// Import Amplify auth method
import API from '../../api/BaseUrl' // Import API base URL


import EditableText from '../../components/EditableText' // Import editbale string component
import EditableDate from '../../components/EditableDate' // Import editable date component
import EditableSelect from '../../components/EditableSelect' // Import editable select component
import DriverDocument from '../../components/DriverDocument' // Import Document viewers component
import DriverTimeline from '../../components/DriverTimeline' // Import Timeline 
import DriverVehicle from '../../components/DriverVehicle' // Import Driver Vehicle component

import useFetch from '../../hooks/use-fetch' // Import useFetch custom hook
import { isAllApproved } from '../../utils/doc-status' // Import isAllApproved function
import { deleteDriver, updateStatus, notifyDriver } from '../../utils/driver-status' // Import delete driver method

const { confirm } = Modal // Destructure config from Modal
const { Title, Text } = Typography // Destructure Title from Typography
const { TextArea } = Input // Destructure TextArea from Input

const SelectFeeder = (props) => {
  const { data, isLoading, error } = useFetch(`/v1/cities`)// Call useFetch custom hook

  if (isLoading) {
    return <>Loading...</>
  }
  
  if (error) {
    return <>Something went wrong</>
  }
  
  return  <EditableSelect updateCallback={props.updateCallback} value={props.value} options={data.items} name="city_id" />
}

//get training video 
const tableColumns = [
    {
        key: '1',
        title: 'Video Title',
        dataIndex: 'title',
    },
  {
        key: '2',
        title: 'Status',
        dataIndex: 'completed',
        align: 'center',
    render: (completed) => <Tag color={completed === true ? 'green' : 'volcano'}>
         {completed === true ? 'Completed' : 'Pending'}
      </Tag>,
    },
  
]

const DriverDetails = () => {
  const {id} = useParams(); // Get id from url
  const navigate = useNavigate(); // Get navigate method from react-router-dom
  const { data, isLoading, error, refetch } = useFetch(`/v1/drivers/cc/${id}`)// Call useFetch custom hook
  const [loading, setLoading] = useState(false)// Set loading state
  const tooltipConfig = {
    placement: 'top',
    color: 'orange',
    title: 'Can only delete inactive drivers',
    ...data?.status === 'inactive' && { open: false, open: false }
  }

  const successAlert = (msg) => { // Success alert method
    message.success(msg)
  }

  const updateText = async (payload) => { // Update text method
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
      content: 'This action cannot be undone, and the driver will be notified.',
      onOk: async () => {
        await updateStatus(status, id)
        .then((res) => {
          if (res) {
            setLoading(false)
            refetch()
          }
        })
      },
      onCancel() {
        setLoading(false)
        console.log('Cancel');
      },
    });
  }

  const showError = (status) => {
    Modal.error({
      title: 'Not all documents are approved',
      content: 
        <Text>
          {`You cannot change the status to `} <Text mark strong>{status}</Text> {`until all documents are approved.`}
        </Text>,
      onOk: () => {
        setLoading(false)
      }
    });
  }

  const showWarning = () => {
    setLoading(true)
    Modal.confirm({
      title: 'Delete driver?',
      content: 
        <Space direction="vertical">
          <Text>
            {`Are you sure you want to delete `} <Text mark strong>{`${data.first_name} ${data.last_name}`}</Text>{` ?`}
          </Text>
          <Text strong>
            {`This action cannot be undone, all of the driver's documents and records will be deleted forever.`}
          </Text>
        </Space>
        ,
      onOk: async () => {
        await deleteDriver(id)
        .then((response) => {
          if(response) {
            setLoading(false)
            navigate('/')
          }
        })
      },
      onCancel: () => {
        setLoading(false)
        //console.log('Cancel')
      },
      okText: 'Yes, Delete',
      cancelText: 'Cancel',
    })
  }

  const showNotifyWarning = () => {
    setLoading(true)
    Modal.confirm({
      title: 'Email Notification',
      content: 
        <Space direction="vertical">
          <Text>
            {`Are you sure you want to continue with this action? `} <Text mark strong>{`${data.first_name} ${data.last_name}`}</Text>{` will recieved an email notification.`}
          </Text>
          <Text strong>
            {`Be wary of sending too many of these notifications, as it may be considered spam.`}
          </Text>
        </Space>
        ,
      onOk: async () => {
        await notifyDriver(id)
        .then((response) => {
          if(response) {
            setLoading(false)
            successAlert(response.message)
          }
        })
      },
      onCancel: () => {
        setLoading(false)
        //console.log('Cancel')
      },
      okText: 'Yes, Notify',
      cancelText: 'Cancel',
    })
  }

  if (error) {
    return <div>Something went wrong</div>
  }
  
  return (
    <Card title={'Driver Details'} loading={isLoading} style={{ margin: 15 }}
      extra={
        <Tooltip {...tooltipConfig}>
          <Button loading={loading} type="primary" danger onClick={showWarning} disabled={data.status !== 'inactive'}>
            Delete Driver
          </Button>
        </Tooltip>
      }
    >
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
            onClick={async () => {
              setLoading(true)
              await isAllApproved(id)
              .then((res) => {
                res ? showConfirm('active') : showError('active')
              })
            }}
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
      <Divider orientation="left"><Title level={4}>Driver Documents</Title></Divider>
        <Space 
          style={{
            display: 'flex',
            justifyItems: 'flex-end',
            justifyContent: 'flex-end',
            margin: ['16px 0'],
          }}
        >
        <Button type="primary" icon={<SendOutlined />} loading={loading}  onClick={() => showNotifyWarning()}>Notify Driver</Button>
        </Space>
        <DriverDocument id={id} sub={data.sub_id} />
        <Divider orientation="left"><Title level={4}>Driver Vehicle</Title></Divider>
        <DriverVehicle id={id} sub={data.sub_id} />
        <Divider orientation="left"><Title level={4}>Driver Trainings</Title></Divider>
        <Table
          columns={tableColumns}
          dataSource={data?.trainings}
          loading={isLoading}
          pagination={false}
          rowKey="title"
          />
      <Divider orientation="left"><Title level={4}>Driver History</Title></Divider>
      <DriverTimeline id={id}/>
      <Divider orientation="left"><Title level={4}>Note</Title></Divider>
      <Form initialValues={{ notes: data.notes }} onFinish={(values) => updateText(values)}>
        <Form.Item 
          name="notes"
          rules={[{required: true,message: 'Please type a note before submitting!'}]}
        >
          <TextArea
            placeholder="Leave notes here..."
            autoSize={{
              minRows: 2,
              maxRows: 6,
            }}
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </Card>
  )
};

export default DriverDetails;
