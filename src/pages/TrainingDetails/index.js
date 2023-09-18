import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
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
    Divider,
    Radio
} from 'antd' // Import antd components
import { PageHeader } from '@ant-design/pro-layout';
import { ArrowLeftOutlined, CheckCircleOutlined, BarChartOutlined } from '@ant-design/icons'

import { Formik, Form as FormikForm } from 'formik' // Import Formik form components
import { object, string } from 'yup'; // Import Yup validation library
import SubmitWrapper from '../../components/forms/SubmitWrapper' // Import SubmitWrapper component
import InputWrapper from '../../components/forms/InputWrapper' // Import InputWrapper component

import ReactPlayer from 'react-player' //Import React Player

import useFetch from '../../hooks/use-new-fetch' // Import useFetch custom hook
import { deleteTraining, updateTraining } from '../../utils/training-status';
    
const { confirm } = Modal // Destructure config from Modal
const { Text } = Typography // Destructure Title from Typography

const trainingSchema = object().shape({
    title: string().required('Required'),
    url: string().required('Required'),
    status: string().required('Required')
})

const TrainingStats = ({id}) => {
    const { data, isLoading, error } = useFetch(`/v1/trainings/${id}/stats`)

    if (isLoading) return <p>Loading...</p>

    if (error) return <p>Something went wrong: {error.message}</p>

    return (
         <Card 
            title={
                <>
                    <BarChartOutlined style={{ fontSize: '16px', color: '#08c', spacing: '16px' }} />
                    Total Views
                </>
            }
            bordered={true}
            style={{ width: 300, margin: "20px", borderRadius: "20px", overflow: "hidden" }}
            bodyStyle={{ backgroundColor: '#f0f0f0', border: 0 }}
        >
                            
            <Statistic
                value={data.percentage}
                precision={2}
                valueStyle={{ color: '#08c' }}
                prefix={<CheckCircleOutlined />}
                suffix="%"
            />
            <Space size={20} direction='horizontal' style={{ width: '100%' }}>
                <Card  style={{ borderRadius: "20px", overflow: "hidden" }}>
                    <Statistic
                        title="Unique Views"
                        value={data.total_views}
                        valueStyle={{ color: '#3f8600' }}
                    />
                </Card>
                <Card style={{ borderRadius: "20px", overflow: "hidden" }}>
                    <Statistic
                        title="Total Drivers"
                        value= {data.total_users}
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
    const { data, isLoading, error, refetch } = useFetch(`/v1/trainings/${id}`)

    //show modal
    const handleOpen = () => {
          setOpen(true)
    }

    const handleClose = () => {
        setOpen(false)
        refetch()
    }

    // handle deleting a video
    const handleDelete = () => {
        confirm({
      title: 
          <Text level={4}>
            {`Are you sure you want to permanently delete `} <Text mark strong>{`${data.title}`}</Text>{` ?`}
          </Text>,
      content: 'This action cannot be undone',
      onOk: async () => {
        await deleteTraining(id)
        .then((response) => {
            message.success(response.message)
            navigate('/trainings')
        })
    } ,
      onCancel() {
        refetch()
      },
    })
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
                    <Button key="1" type="primary" onClick={handleOpen}>
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
                    status: data.status
                }}
                validationSchema={trainingSchema}
                onSubmit={async (values, { setSubmitting }) => {
                    await updateTraining(values, id)
                    .then(() => {
                        message.success('Training updated successfully')
                        setSubmitting(false)
                        handleClose()
                    })
                }}
            >
                {props => (
                    <FormikForm>
                        <Modal
                            title="Edit Training"
                            open={open}
                            onCancel={handleClose}
                            footer={[
                                <Button key="cancel" onClick={handleClose}>
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
                                <Divider> Status </Divider>
                                <Radio.Group
                                    style={{ width: '100%' }}
                                    onChange={ (e) => {
                                        props.setFieldValue('status', e.target.value)
                                    }}
                                    value={props.values.status}
                                >
                                    <Space>
                                        <Radio value="active">Active</Radio>
                                        <Radio value="inactive">Inactive</Radio>
                                    </Space>
                                            </Radio.Group>
                            </Space>
                        </Modal>
                    </FormikForm>
                )}
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
    )
}
    
export default TrainingDetails;