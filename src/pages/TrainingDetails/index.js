import API from '../../api/BaseUrl' // Import API base URL
import { useParams } from 'react-router-dom'
import useFetch from '../../hooks/use-fetch' // Import useFetch custom hook
import { Auth } from 'aws-amplify'// Import Amplify auth method
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import InputWrapper from '../../components/forms/InputWrapper' // Import InputWrapper component
import { Formik, Form } from 'formik' // Import Formik form components
import * as yup from 'yup'; // Import Yup validation library
import SubmitWrapper from '../../components/forms/SubmitWrapper' // Import SubmitWrapper component
import ReactPlayer from 'react-player' //Import React Player
import { ArrowLeftOutlined,CheckCircleOutlined, BarChartOutlined } from '@ant-design/icons'
import { PageHeader } from '@ant-design/pro-layout';



import { 
  
  Card, 
  Descriptions, 
  Button, 
  Tag, 
  message,
  Modal,
  Space,
  Typography,
  Statistic,
    
} from 'antd' // Import antd components
    
const { confirm } = Modal // Destructure config from Modal

const TrainingStats = ({id}) => {
    const { data, isLoading, error, refetch } = useFetch(`/v1/trainings/cc/${id}/stats`)

    if (isLoading) return <p>Loading...</p>

    if (error) return <p>Something went wrong: {error.message}</p>

    return (
         <Card title={<p>  <BarChartOutlined style={{ fontSize: '16px', color: '#08c', spacing: '16px' }} /> Total Views</p>}
                        bordered={true}
                        style={{ width: 300, margin: "20px", borderRadius: "20px", overflow: "hidden" }}
                        bodyStyle={{ backgroundColor: '#f0f0f0', border: 0 }}>
                            
                            <Statistic
                                    
                                    value={data.views.percentage}
                                    precision={2}
                                    valueStyle={{ color: '#08c' }}
                                    prefix={<CheckCircleOutlined />}
                                    suffix="%"
                            />
                        <Space size={20} direction='horizontal' style={{ width: '100%' }}>
                            <Card  style={{ borderRadius: "20px", overflow: "hidden" }}>
                                <Statistic
                                    title="Unique Views"
                                    value={data.views.total_views}
                                    valueStyle={{ color: '#3f8600' }}
                                />
                            </Card>
                            <Card style={{ borderRadius: "20px", overflow: "hidden" }}>
                                <Statistic
                                    title="Total Drivers"
                                    value= {data.views.total_users}
                                    valueStyle={{ color: '#cf1322' }}

                                />
                            </Card>
                        </Space>
                    </Card>
    )
}

//get training details
const TrainingDetails = () => {

    const navigate = useNavigate()
    const { id } = useParams()
    const [open, setOpen] = useState(false); // Set open state for modal
    const { Text } = Typography // Destructure Title from Typography

    const [loading, setLoading] = useState(false)// Set loading state
    

    const { data, isLoading, error, refetch } = useFetch(`/v1/trainings/cc/${id}`)

    //show modal
    const showModal = () => {
          setOpen({ ...open, modal: true })
    };

    // handle deleting a video
    const handleDelete = () => {
    setLoading(true)
        confirm({
       
      title: 
          <Text level={4}>
            {`Are you sure you want to permanently delete `} <Text mark strong>{`${data.title}`}</Text>{` ?`}
          </Text>,
      content: 'This action cannot be undone',
      onOk: async () => {
    
                try {
                    const auth = await Auth.currentSession()// Get current session
                    const token = auth.getAccessToken().getJwtToken()// Get token from session
                    const options = { // Set options for fetch
                        headers: {
                            Authorization: token,
                            ...(process.env.REACT_APP_ENV && { 'env': process.env.REACT_APP_ENV }),
                        }
                    }
                    const response = await API.delete(`/v1/trainings/cc/${id}`, options)
                    const data = await response.data
                    if (data) {
                        message.success('Training deleted successfully')
                        navigate('/trainings')
                    }
                     } catch (error) {
                    console.log(error)
                }
        
    } ,
      onCancel() {
        setLoading(false)
        console.log('Cancel');
      },
    });
  }
      
   
    if (isLoading) {
    return <>Loading...</>
    }
  
    if (error) {
        return <>Something went wrong</>
    }
    return (
        <Card>
                <PageHeader
                
                    title={[
                        <Button onClick={() => window.history.back()} type="text" icon={<ArrowLeftOutlined />} />,
                        data.title,
                    ]}
                    subTitle={data.city_id ?? 'All Cities'}
                    extra={[
                        <Button key="1" type="primary" onClick={showModal}>
                            Edit
                        </Button>,
                        <Button key="2" type="primary" danger onClick={handleDelete}>
                            Delete
                        </Button>,
                    ]}
                >
                    <Descriptions size="small" column={3}>
                        <Descriptions.Item label="Status">
                            <Tag color={data.status === 'active' ? 'green' : 'red'}>{data.status.toUpperCase()}</Tag>
                        </Descriptions.Item>
                    </Descriptions>
                </PageHeader>
            
                <Formik
                    initialValues={{
                        title: data.title,
                        url: data.url,
                    }}
                    validationSchema={yup.object({
                        title: yup.string().required('Required'),
                        url: yup.string().required('Required'),
                    })}
                    onSubmit={async (values, { setSubmitting }) => {
                        try {
                            const auth = await Auth.currentSession()// Get current session
                            const token = auth.getAccessToken().getJwtToken()// Get token from session
                            const options = { // Set options for fetch
                                headers: {
                                    Authorization: token,
                                    ...(process.env.REACT_APP_ENV && { 'env': process.env.REACT_APP_ENV }),
                                }
                            }
                            const response = await API.put(`/v1/trainings/cc/${id}`, values, options)
                            const data = await response.data
                            if (data) {
                                message.success('Training updated successfully')
                                refetch()
                                setOpen({ ...open, modal: false })
                            }
                        } catch (error) {
                            console.log(error)
                        }
                    }}
            >
            
                    <Form>
                        <Modal
                            title="Edit Training"
                            open={open.modal}
                            onCancel={() => setOpen({ ...open, modal: false })}
                            footer={[
                                <Button key="cancel" onClick={() => setOpen(false)}>
                                    Cancel
                                </Button>,
                                <SubmitWrapper key="submit" type="primary" >
                                    Update Training Video
                                </SubmitWrapper>
                            ]}
                        >
                            <Space direction='vertical' style={{ width: '100%' }}>
                                <InputWrapper type="text" name="title" placeholder="Title"></InputWrapper>
                                <InputWrapper type="text" name="url" placeholder="Youtube Link"></InputWrapper>
                            </Space>
                        </Modal>
                    </Form>
            </Formik>
            <Space size={90} direction='horizontal' style={{ width: '100%' }}>
            
                <ReactPlayer
                    url={data.url}
                    controls
                    config={{
                        youtube: {
                            playerVars: {
                                origin: 'https://www.youtube.com',
                                cc_load_policy: 1,
                                cc_lang_pref: 'en',
                                disablekb: 1,
                                modestbranding: 1,
                                fs: 1,
                                enablejsapi: 0,
                            }
                        }
                        
                    }}
                   
                    />
                <TrainingStats id={id} /> 
            </Space>
        </Card>
    );
};
    
export default TrainingDetails;