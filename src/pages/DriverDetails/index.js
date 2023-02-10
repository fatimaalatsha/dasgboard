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
  Popover,
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
import PinkSlipModal from '../../components/PinkSlipModal' // Import PinkSlip component

import SubmitWrapper from '../../components/forms/SubmitWrapper' // Import SubmitWrapper component
import SelectWrapper from '../../components/forms/SelectWrapper' // Import SelectWrapper component

import useFetch from '../../hooks/use-fetch' // Import useFetch custom hook
import { isAllApproved, deleteAdditionalDoc, enableAdditionalDocs, disableAdditionalDocs } from '../../utils/doc-status' // Import isAllApproved function
import { updateStatus, notifyDriver,updateApplicationStatus, updateDriver } from '../../utils/driver-status' // Import delete driver method
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

const ProfileAvatar = ({objectKey, driverName, driverid, picture, refetch}) => {
  const [ url, setUrl ] = useState(null) // Create state to store the URL of the S3 object
  const [ visible, setVisible ] = useState(false) // Create state to store the visibility of the image
  const [ loading, setLoading ] = useState(false) // Create state to store the loading state of the image
  const driverInitials = driverName.split(/\s/).reduce((response,word)=> response+=word.slice(0,1),'') // Get driver initials

  const getDocument = async () => { // Create a function to retrieve the document
      await getFromS3(objectKey).then((url) => { // Call the getFromS3 function
          setUrl(url) // Set the URL state
      })
      .catch(error => console.log(error))
  }


  const handleConfirm = async () => { // Create a function to handle the confirmation of the delete
      setLoading(true) // Set the loading state to true
      await updateDriver(driverid, {"picture": "null"}) // Call the updateDriver function to delete the profile picture
      .then(() => {
          setLoading(false) // Set the loading state to false
          message.success('Profile picture deleted successfully') // Display success message
          refetch() // Refetch the driver details
      })
      .catch(error => {
          setLoading(false) // Set the loading state to false
          message.error('An error occured while deleting the profile picture') // Display error message
          console.log(error)
      })
  }


  useEffect(() => { // Call the getDocument function on component mount
      if(!url){
          getDocument()
      }
  }, [url])

  if(!url) {
      return <Spin />
  }

  const content = (
    <Popconfirm 
      title="You are about to delete this profile picture."
      description="Are you sure you want to delete it?"
      onConfirm={handleConfirm}
      okText="Yes, Delete"
      cancelText="No, Cancel"
      okButtonProps={{ 
        danger: true,
        loading: loading,
      }}
      disabled={!picture}
    >
      <Button type="primary" danger block disabled={!picture}>
        Delete
      </Button>
    </Popconfirm>
  )

  return (
    <>
      <Popover content={content} title="Delete Profile Picture">
        <Avatar size={72} src={url} onClick={() => setVisible(true)} style={{ cursor: 'pointer'}} >
          {driverInitials}
        </Avatar>
      </Popover>
      <Image
        src={url}
        style={{
          display: 'none',
        }}
        preview={{
          visible,
          onVisibleChange: (value) => setVisible(value),
        }}
        fallback="data:image/png;base64,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"
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
  console.log(data)
  const [loading, setLoading] = useState(false)// Set loading state
  const [open, setOpen] = useState(false)// Set custom message state
  const [documentDrawer, setDocumentDrawer] = useState(false)// Set document drawer state
  const [changeStatusModal, setChangeStatusModal] = useState(false)// Set change status modal state
  const [slip, setSlip] = useState(false)// Set slep modal state
  const [showSubIneligible, setShowSubIneligible] = useState(false)// Set show sub state
  const [showSubDNC, setShowSubDNC] = useState(false)// Set show sub state

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
    { text:'Awaiting Documents',  value: 'Awaiting Documents' , key: 'Awaiting Documents' },
    { text: 'Ineligible' ,value: 'Ineligible' , key: 'Ineligible' },
    { text: 'Unresponsive',value: 'Unresponsive', key: 'Unresponsive' },
  ]

  const subOptionIneligible = [ 
    { text: 'Underage', value: 'Underage', key: 'Underage' },
    { text: 'Unqualified licence class', value: 'Unqualified licence class', key: 'Unqualified licence class' },
    { text: 'Background check - Failed', value: 'Background check - Failed', key: 'Background check - Failed' },
    { text: 'Driver Abstract - Failed', value: 'Driver Abstract - Failed', key: 'Driver Abstract - Failed' },
    { text: 'Unqualified vehicle', value: 'Unqualified vehicle', key: 'Unqualified vehicle' },
    { text: 'Rejected City Licence', value: 'Rejected City Licence', key: 'Rejected City Licence' },
  ]
  
  const subOptionDNC = [
    { text: 'Opted Out', value: 'Opted Out', key: 'Opted Out' },
    { text: 'Banned', value: 'Banned', key: 'Banned' },
    { text: 'International', value: 'International', key: 'International' },
    { text: 'Rejected', value: 'Rejected', key: 'Rejected' },
  ]

  // Handle sub option to show or hide
  const handleSubOption = (value) => {
    value === 'Ineligible' ? setShowSubIneligible(true) : setShowSubIneligible(false)
    value === 'Do not contact (DNC)' ? setShowSubDNC(true) : setShowSubDNC(false)
  }

  if (error) {
    return <div>Something went wrong</div>
  }

  if (isLoading) {
    return <div>Loading...</div>
  }
  
  return (
    <Card title={'Driver Details'} loading={isLoading} style={{ margin: 15 }}
      extra={[
        <Button type="primary" key='status' loading={loading} onClick={() => { setChangeStatusModal(true); handleSubOption(data.application_status)}}>
               Change Application Status 
            </Button>
      ]}
    >
      <PageHeader
        ghost={false}
        onBack={() => window.history.back()}
        title={
        <Space>
          <ProfileAvatar refetch={refetch} objectKey={`${data.sub_id}/${data.profile_picture}`} driverName={`${data.first_name} ${data.last_name}`} driverid={id} picture={data.profile_picture}/>
          <Space direction='vertical' size={0}>
            <Title level={4} style={{ marginTop: 0 }}>
              {`${data.first_name} ${data.last_name}`}
              </Title>
              <Space size={0} direction='horizontal'>
               { ((data.application_status!=='Do not contact (DNC)' && data.application_status !=='Ineligible' && data.application_status !== 'Unresponsive') || data.status ==='active') && <Tag style={{ textTransform: 'capitalize'}} 
                  color={data.status === 'active' ? 'success' : data.status === 'inactive' ? 'error' : 'warning'}>
                  {data.status}
                  </Tag>}
                  {(data.application_status && data.status !=='active' ) && <Tag style={{ textTransform: 'capitalize' }}
                    color={data.application_status === 'Do not contact (DNC)' ? 'magenta' : data.application_status === 'Ineligible' ? 'volcano' : 'red'}
                  >
                    {data.application_status} {(data.application_status==='Do not contact (DNC)' || data.application_status ==='Ineligible')  && ` - ${data.status_reason}`}
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
        {(data.status === 'active' && data.city.province_id === 1)  && <Button type="primary" onClick={() => setSlip(true)}>Create Pink Slip</Button>}
        <Button type="primary" icon={<SendOutlined />} loading={loading} onClick={() => setOpen(true)}>Notify Driver</Button>
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
        onSubmit={async (values, { setSubmitting }) => {
          await updateApplicationStatus( id, values.application_status, values.status_reason)
            .then((response) => {
              if (response) {
                successAlert(response.message)
                setSubmitting(false)
                setChangeStatusModal(false)
                refetch()
              }
            })
        }}
      >
        {props => (
          <FormikForm>
            <Modal
              title="Update Application Status"
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
                  {`Are you sure you want to continue with this action? `} <Text mark strong>{`${data.first_name} ${data.last_name}`}</Text>{` will have their application status changed to `} <Text mark strong>{`${props.values.application_status}`}</Text>
                </Text>
                <Form.Item
                  rules={[{ required: true, message: 'Please select a status!' }]}
                >
                  <SelectWrapper   
                    type="text" name="application_status" datasource={option} placeholder="Select a status" onSelect={handleSubOption} key={option.key} />
                </Form.Item>
                <Form.Item 
                 rules={[{ required: true, message: 'Please select a status!'}]}>
                  {showSubIneligible && <SelectWrapper type="text" name="status_reason" datasource={subOptionIneligible} placeholder="Select one of the following reasons" key={subOptionIneligible.key} />} 
                  {showSubDNC && <SelectWrapper type="text" name="status_reason" datasource={subOptionDNC} placeholder="Select one of the following reasons" key={subOptionDNC.key} />}
                </Form.Item>
              </Space>
            </Modal>
          </FormikForm>
        )}
      </Formik>
      { /*end change Application application_status modal*/}
      {/* pink slip modal */}
      
     { slip && <PinkSlipModal id={id} usersub={data.sub_id} open={slip} setOpen={setSlip} />}

      {/* end pink slip modal */}
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
