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
import ReactPlayer, {ReactPlayerProps} from 'react-player' //Import React Player


import { 
  Card, 
  Descriptions, 
  PageHeader, 
  Button, 
  Tag, 
  message,
  Modal,
  Space,
  Typography
  } from 'antd' // Import antd components
const { confirm } = Modal // Destructure config from Modal


const TrainingDetails = () => {
    
    const navigate = useNavigate()
    const { id } = useParams()
    const [open, setOpen] = useState(false);
    const { Title } = Typography // Destructure Title from Typography
    const [loading, setLoading] = useState(false)// Set loading state

    const { data, isLoading, error, refetch } = useFetch(`/v1/trainings/cc/${id}`)
          const showModal = () => {
          setOpen({ ...open, modal: true })
    };

    const handleDelete = () => {
    setLoading(true)
    confirm({
      title: 
          <Title level={4}>
            {`Are you sure you want to permanently delete this training video ?`}
          </Title>,
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
  
    // const handleDelete = async () => {
    

    //             try {
    //                 const auth = await Auth.currentSession()// Get current session
    //                 const token = auth.getAccessToken().getJwtToken()// Get token from session
    //                 const options = { // Set options for fetch
    //                     headers: {
    //                         Authorization: token,
    //                         ...(process.env.REACT_APP_ENV && { 'env': process.env.REACT_APP_ENV }),
    //                     }
    //                 }
    //                 const response = await API.delete(`/v1/trainings/cc/${id}`, options)
    //                 const data = await response.data
    //                 if (data) {
    //                     message.success('Training deleted successfully')
    //                     navigate('/trainings')
    //                 }
    //                  } catch (error) {
    //                 console.log(error)
    //             }
        
    // }

    // update training video
    if (isLoading) {
    return <>Loading...</>
    }
  
    if (error) {
        return <>Something went wrong</>
    }
    return (
        <Card>
            <PageHeader
                title={data.title}
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
                visible={open.modal}
                onCancel={() => setOpen({ ...open, modal: false })}
                 footer={[
                                        <Button key="cancel" onClick={() =>  setOpen(false)}>
                                            Cancel
                                        </Button>,
                                        <SubmitWrapper key="submit" type="primary" >
                                            Add New Training Video
                                        </SubmitWrapper>
                                    ]}   
            >
            <Space direction='vertical' style={{ width: '100%'}}>

                <InputWrapper type="text" name="title" placeholder="Title"></InputWrapper>
                <InputWrapper type="text" name="url" placeholder="Youtube Link"></InputWrapper>
                            
            </Space>
   
                        </Modal>
                        </Form>
            </Formik>
            
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
                        }
                    }
                        
                }}
            />
        </Card>
       
    );
};
    
export default TrainingDetails;