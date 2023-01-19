import { useState, useEffect } from 'react'
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
  message,
  Table,
  Form,
  Input,
  Avatar,
  Spin,
  Image,
  Switch,
  Row,
  Col,
  Popconfirm,
  Drawer,
  Empty,
  Alert,
} from 'antd' // Import antd components
import { SendOutlined, QuestionCircleOutlined, CopyFilled, CopyOutlined } from '@ant-design/icons' // Import icon
import { useParams } from 'react-router-dom'
import { Auth } from 'aws-amplify'// Import Amplify auth method
import { Formik, Form as FormikForm } from 'formik'   // Import Formik form components
import API from '../../api/BaseUrl' // Import API base URL


import EditableText from '../../components/EditableText' // Import editbale string component
import EditableDate from '../../components/EditableDate' // Import editable date component
import EditableSelect from '../../components/EditableSelect' // Import editable select component
import DriverDocument from '../../components/DriverDocument' // Import Document viewers component
import DriverTimeline from '../../components/DriverTimeline' // Import Timeline 
import DriverVehicle from '../../components/DriverVehicle' // Import Driver Vehicle component
import DocViewer from '../../components/DocViewer' // Import DocViewer component

import SubmitWrapper from '../../components/forms/SubmitWrapper' // Import SubmitWrapper component
import SelectWrapper from '../../components/forms/SelectWrapper' // Import SelectWrapper component

import useFetch from '../../hooks/use-fetch' // Import useFetch custom hook
import { isAllApproved, deleteAdditionalDoc, enableAdditionalDocs, disableAdditionalDocs } from '../../utils/doc-status' // Import isAllApproved function
import { updateStatus, notifyDriver } from '../../utils/driver-status' // Import delete driver method
import { getFromS3 } from '../../utils/s3-storage' // Import getFromS3 method

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

const ProfileAvatar = ({objectKey}) => {
  const [ url, setUrl ] = useState(null) // Create state to store the URL of the S3 object
  const [ visible, setVisible ] = useState(false) // Create state to store the visibility of the image

  const getDocument = async () => { // Create a function to retrieve the document
      await getFromS3(objectKey).then((url) => { // Call the getFromS3 function
          setUrl(url) // Set the URL state
      })
      .catch(error => console.log(error))
  }

  useEffect(() => { // Call the getDocument function on component mount
      if(!url){
          getDocument()
      }
  }, [url])

  if(!url) {
      return <Spin />
  }


  return (
    <>
      <Avatar size={72} src={url} onClick={() => setVisible(true)} style={{ cursor: 'pointer'}} />
      <Image
        src={url}
        style={{
          display: 'none',
        }}
        preview={{
          visible,
          onVisibleChange: (value) => setVisible(value),
        }}
      />
    </>
  )
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
    render: (completed) => <Tag color={completed ? 'green' : 'volcano'}>
         {completed ? 'Completed' : 'Pending'}
      </Tag>,
    },
  
]

const DriverDetails = () => {
  const {id} = useParams(); // Get id from url
  const { data, isLoading, error, refetch } = useFetch(`/v1/drivers/cc/${id}`)// Call useFetch custom hook
  const [loading, setLoading] = useState(false)// Set loading state
  const [open, setOpen] = useState(false)// Set custom message state
  const [documentDrawer, setDocumentDrawer] = useState(false)// Set document drawer state
  const [changeStatusModal, setChangeStatusModal] = useState(false)// Set change status modal state
  const [showSub, setShowSub] = useState(false)// Set show sub state
 

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

  const showConfirmInactive = (status) => {
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
        await isAllApproved(id)
        .then((res) => {
          if (res) {
            setLoading(false)
            refetch()
          } else {
            setLoading(false)
            showError('active')
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



  const option = [
    { text:'Do not contact (DNC)',  value: 'Do not contact (DNC)' , key: 'Do not contact (DNC)' },
    { text: 'Ineligible' ,value: 'Ineligible' , key: 'Ineligible' },
    { text: 'Unresponsive',value: 'Unresponsive', key: 'Unresponsive' },
  ];

  const subOption = [
    { text: 'Underage', value: 'Underage', key: 'Underage' },
    { text: 'Wrong licence class', value: 'Wrong licence class', key: 'Wrong licence class' },
    { text: 'Failed background check', value: 'Failed background check', key: 'Failed background check' },
    { text: 'International', value: 'International', key: 'International' },
    { text: 'Vehicle age', value: 'Vehicle age', key: 'Vehicle age' },
    { text: 'Will reach out to Recruitment for more', value: 'Will reach out to Recruitment for more', key: 'Will reach out to Recruitment for more' },
  ];
  
  const handleSubOption = (value) => {
    if (value === 'Ineligible') {
      setShowSub(true)
    }
  }

  const changeApplicationStatus = async (applicationStatus, statusReason) => {
     try {
      const auth = await Auth.currentSession()// Get current session
      const token = auth.getAccessToken().getJwtToken()// Get token from session
      const options = { // Set options for fetch
          headers: {
              'Authorization': token,
              ...(process.env.REACT_APP_ENV && {'env': process.env.REACT_APP_ENV}),
          }
      }
      const body = {
        application_status: applicationStatus,
        status_reason: statusReason
      }
      const response = await API.put(`/v1/drivers/cc/${id}`, body, options)
      const data = await response.data
       if (data) {
          setChangeStatusModal(false)
          refetch() // Refetch data
      }
    } catch (error) {
      console.log(error)
    }
  }

  if (error) {
    return <div>Something went wrong</div>
  }
  
  return (
    <Card title={'Driver Details'} loading={isLoading} style={{ margin: 15 }}
      extra={[
            <Button type="primary" key='status' loading={loading} onClick={() => setChangeStatusModal(true)}>
               Change Applicaction Status
            </Button>
      ]}
    >
      <PageHeader
        ghost={false}
        onBack={() => window.history.back()}
        title={
        <Space>
          <ProfileAvatar objectKey={`${data.sub_id}/${data.profile_picture}`} />
          <Space direction='vertical'  size={0}>
            <Title level={4} style={{ marginTop: 0 }}>
              {`${data.first_name} ${data.last_name}`}
              </Title>
              <Space size={0} direction='horizontal'>
                <Tag style={{ textTransform: 'capitalize'}} 
                  color={data.status === 'active' ? 'success' : data.status === 'inactive' ? 'error' : 'warning'}>
                  {data.status}
                  </Tag>
                  {data.application_status &&<Tag style={{ textTransform: 'capitalize' }}
                    color={data.application_status === 'Do not contact (DNC)' ? 'success' : data.application_status === 'Ineligible' ? 'error' : 'warning'}
                  >
                    {data.application_status}
                  </Tag>}
              </Space>
          </Space>
          </Space>
          
        }
        extra={[
          <Button 
            loading={loading} 
            key="2" 
            danger 
            onClick={() => showConfirmInactive('inactive')}
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
        { data.application_status ==='Ineligible' && <Alert
              message={data.application_status}
              description={data.status_reason}
              type="warning"
              showIcon
        />}
        <p></p>
            <Descriptions labelStyle={{ fontWeight: 'bold' }}  >
            <Descriptions.Item label="First Name">
              <EditableText name='first_name' value={data.first_name} updateCallback={updateText} />
            </Descriptions.Item>
            <Descriptions.Item label="Last Name">
              <EditableText name='last_name' value={data.last_name} updateCallback={updateText} />
            </Descriptions.Item>
            <Descriptions.Item label="Email">
            <Text name='email' copyable={{
            icon: [<CopyOutlined />, <CopyFilled key="copied-icon" />],
              tooltips: ['Copy Email', 'Email Copied'],
            }}>
              {data.email}
            </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Phone Number">
            <EditableText name='phone' value={data.phone} updateCallback={updateText} copyable/>
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
            <Descriptions.Item label="HST Number">
              <EditableText name='hst_number' value={data.hst_number} updateCallback={updateText} />
            </Descriptions.Item>
        </Descriptions>
      </PageHeader>
      <Row>
        <Col flex={4}>
          <Divider orientation="left">
            <Title level={4} style={{ marginBottom: 26.6 }}>Driver Documents</Title>
          </Divider>
        </Col>
        <EnableAdditionalDocs status={data.additional_docs} id={id} refetch={refetch} />
      </Row>
        <Space 
          style={{
            display: 'flex',
            justifyItems: 'flex-end',
            justifyContent: 'space-between',
            margin: ['16px 0'],
          }}
        >
          <Button type="primary" onClick={() => setDocumentDrawer(true)}>View Additional Documents</Button>
          <Button type="primary" icon={<SendOutlined />} loading={loading}  onClick={() => setOpen(true)}>Notify Driver</Button>
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
      <Divider orientation="left"><Title level={4}>Driver History</Title></Divider>
      <DriverTimeline id={id}/>

    {/* Notify Driver Modal */}
      <Formik
        initialValues={{ message: '',}}
        onSubmit={ async (values, { setSubmitting }) => {
          await notifyDriver(id, values)
          .then((response) => {
            if(response) {
              setLoading(false)
              successAlert(response.message)
              setOpen(false)
              setSubmitting(false)
              refetch()
            }
          })
        }}
    >
      { props => (
        <FormikForm>
          <Modal 
            title="Email Notification" 
            open={open} 
            onCancel={() => setOpen(false)}
            destroyOnClose
            footer={[
              <Button key="back" onClick={() => setOpen(false)}>
                  Cancel
              </Button>,
              <SubmitWrapper key="submit" type="primary">
                  Yes, Notify
              </SubmitWrapper>,
            ]}
          >
            <Space direction="vertical">
              <Text>
                {`Are you sure you want to continue with this action? `} <Text mark strong>{`${data.first_name} ${data.last_name}`}</Text>{` will recieved an email notification.`}
              </Text>
              <Text type="danger">
                {`Be wary of sending too many of these notifications, as it may be considered spam.`}
              </Text>
              <Text strong>
                {`You can add a custom message below, but it is not required.`}
              </Text>
              <TextArea
                  defaultValue={props.values.message}
                  onChange={props.handleChange}
                  name="message"
                  placeholder="Custom message here..."
                  autoSize={{
                    minRows: 2,
                    maxRows: 6,
                  }}
                />
            </Space>
          </Modal>
        </FormikForm>
      )}
      </Formik>
    {/* End Notify Driver Modal */}

    { /* Additional Documents Drawwer */ }
      <AdditionalDocsDrawer open={documentDrawer} setOpen={setDocumentDrawer} driverid={id} sub={data.sub_id} />
      { /* End Additional Documents Drawwer */}
      { /*change Application Status modal*/}
      <Formik
        initialValues={{ application_status: data.application_status, status_reason: data.status_reason }}
        onSubmit={ async (values, { setSubmitting }) => {
          console.log(values)
          await changeApplicationStatus(values.application_status, values.status_reason )
            .then((response) => {
              if (response) {
                successAlert(response.message)
                setSubmitting(false)
                refetch()
              }
            }
          )
        }}
        
      >
        {props => (
          <FormikForm>
            <Modal
              title="Change Application application_status"
              open={changeStatusModal}
              onCancel={() => setChangeStatusModal(false)}
              destroyOnClose
              footer={[
                <Button key="Back"
                onClick={() => setChangeStatusModal(false)}
                >
                  Cancel
                </Button>,
                <SubmitWrapper key="Submit" type="primary">
                  Yes, Change
                </SubmitWrapper>,
              ]}
            >
              <Space direction="vertical">
                <Text>
                  {`Are you sure you want to continue with this action? `} <Text mark strong>{`${data.first_name} ${data.last_name}`}</Text>{` will recieved an email notification.`}
                </Text>
                <Text type="danger">
                  {`Be wary of sending too many of these notifications, as it may be considered spam.`}
                </Text>
                <Form.Item
                  rules={[{ required: true, message: 'Please select a status!' }]}
                >
                  <SelectWrapper   
                    type="text" name="application_status" datasource={option} placeholder="Province" onSelect={handleSubOption} key={option.key} />
                </Form.Item>
                <Form.Item 
                 rules={[{ required: true, message: 'Please select a status!' }]}>
                  {showSub && <SelectWrapper type="text" name="status_reason" datasource={subOption} placeholder="more" key={subOption.key} />}  
                </Form.Item>
              </Space>
            </Modal>
          </FormikForm>
        )}
      </Formik>
      { /*end change Application application_status modal*/}

    </Card>
  )
}

const EnableAdditionalDocs = ({status, id, refetch}) => { // TODO: Implement enable additional docs endpoint
  const [addDocState, setAddDocState] = useState({
    open: false,
    confirmLoading: false,
    enabled: status,
  })

  const showPopconfirm = () => {
    setAddDocState({
      ...addDocState,
      open: true,
    })
  }

  const handleOk = async () => {
    setAddDocState({
      ...addDocState,
      confirmLoading: true,
    })
    addDocState.enabled ? 
    await disableAdditionalDocs(id).then((response) => {
      if(response) {
        message.success('Additional documents disabled.')
       } else {
        message.error('Something went wrong, please try again.')
        }
      })
      : 
    await enableAdditionalDocs(id).then((response) => {
      if(response) {
        message.success('Additional documents enabled.')
        } else {
          message.error('Something went wrong, please try again.')
        }
      })
    setAddDocState({
      ...addDocState,
      open: false,
      confirmLoading: false,
      enabled: !addDocState.enabled,
    })
    refetch()
  }

  const handleCancel = () => {
    setAddDocState({
      ...addDocState,
      open: false,
    })
  }

  return (
    <Space style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginLeft: 8}}>
      Enable Additional Documents?
      <Popconfirm
        title="Additional Documents"
        description={
        <Text>
          {`Are you sure you want to `} <Text mark strong>{addDocState.enabled ? 'disable' : 'enable'}</Text> {`additional documents?`}
        </Text>
      }
        icon={ <QuestionCircleOutlined style={{ color: 'red' }} /> }
        open={addDocState.open}
        onConfirm={handleOk}
        okButtonProps={{
          loading: addDocState.confirmLoading,
        }}
        onCancel={handleCancel}
    >
      <Switch checked={addDocState.enabled} loading={addDocState.confirmLoading} onChange={showPopconfirm}/>
    </Popconfirm>
    </Space>
  )
}

const AdditionalDocsDrawer = ({ open, setOpen, driverid, sub }) => {

  return (
    <Drawer
      title="Additional Documents"
      placement="right"
      size="large"
      onClose={() => setOpen(false)}
      destroyOnClose
      open={open}
    >
      <AdditionalDocsFeeder driverid={driverid} sub={sub} />
    </Drawer>
  )
}

const AdditionalDocsFeeder = ({ driverid, sub }) => {
  const { data, isLoading, error, refetch } = useFetch(`/v1/documents/cc/additional/${driverid}`)// Call useFetch custom hook

  const PopDeleteButton = ({id}) => {
    const [ popState, setPopState ] = useState({
      open: false,
      confirmLoading: false,
    })

    const showPopconfirm = () => {
      setPopState({
        ...popState,
        open: true,
      })
    }
  
    const handleOk = async () => {
      setPopState({
        ...popState,
        confirmLoading: true,
      })
      await deleteAdditionalDoc(id).then((response) => {
        if(response) {
          message.success('Document deleted successfully')
        } else {
          message.error('Error deleting document')
        }
        setPopState({
          ...popState,
          open: false,
          confirmLoading: false,
        })
        refetch()
      })
    }
  
    const handleCancel = () => {
      setPopState({
        ...popState,
        open: false,
      })
    }

    return (
      <Popconfirm
        title="Delete Document"
        description="Are you sure to delete this document?"
        placement="bottom"
        open={popState.open}
        onConfirm={handleOk}
        okButtonProps={{
          loading: popState.confirmLoading,
        }}
        onCancel={handleCancel}
        icon={
          <QuestionCircleOutlined
            style={{
              color: 'red',
            }}
          />
        }
      >
        <Button danger type="primary" onClick={showPopconfirm} >Delete</Button>
      </Popconfirm>
    )
  }

  if (isLoading) return <Spin />

  if (error) return <Text type="danger">Something went wrong</Text>

  return (
    <Space direction="vertical" size="large">
      {
        data.items.length === 0 ? <Empty /> :
        data.items.map((doc, idx) => (
          <Space direction="vertical" key={idx}>
            <Space style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between'}}>
              <Title level={4}>{doc.custom_name}</Title>
              <PopDeleteButton id={doc.id} refetch={refetch} />
            </Space>
            <DocViewer key={idx} objectKey={`${sub}/${doc.key1}`} />
          </Space>
        ))
      }
    </Space>
  )
}

export default DriverDetails;
