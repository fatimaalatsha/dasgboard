import { Card, Table, Tag, Button, Tooltip, Space , Modal } from 'antd' // Import Ant components
import { ReloadOutlined } from '@ant-design/icons' // Import Ant Icons
import dayjs from "dayjs"// Import date handlers
import useFetch from '../../hooks/use-fetch'// Import useFetch custom hook

import React ,{ useState } from 'react'; // Import React
import { useNavigate } from 'react-router-dom'; // Import Nav component

import * as yup from 'yup'; // Import Yup validation library

import { Auth } from 'aws-amplify'// Import Auth from aws-amplify
import API from '../../api/BaseUrl' // Import API base URL
import { message } from 'antd' // Import Ant components

import SubmitWrapper from '../../components/forms/SubmitWrapper' // Import SubmitWrapper component
import InputWrapper from '../../components/forms/InputWrapper' // Import InputWrapper component
import SelectWrapper from '../../components/forms/SelectWrapper' // Import SelectWrapper component

import { Formik, Form } from 'formik'   // Import Formik form components



const tableColumns = [
    {
        title: 'Name',
        dataIndex: 'title',
    },
    {
        title: 'Cities',
        dataIndex: 'city_id',
        render: (city_id) => city_id ?? <Tag color="blue">All Cities</Tag>,
    },
    {
        title: 'Status',
        dataIndex: 'status',
        align: 'center',
        render: (status) => <Tag color={status === 'active' ? 'green' : 'red'}>{status.toUpperCase()}</Tag>,
    },
    {
        title: 'Updated At',
        dataIndex: 'updated_at',
        render: (text, record) => `${dayjs(text).format('YYYY-MM-DD - HH:mm:ss')}`,
        align: 'right',
    },
]

const Trainings = () => {
    const { data, isLoading, error, refetch } = useFetch(`/v1/trainings/cc`) // Fetch data from API
    const [cities, setCities] = useState([])
    const [open, setOpen] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [showCities, setShowCities] = useState(false);
    
    // navigate to video details page
      const navigate = useNavigate();

      const showModal = () => {
          setOpen({ ...open, modal: true })
          getCities();
    };
    //handle closing modal
    const handleCancel = () => {
    setOpen(false);
    };
    

    const buttonConfig = {
        icon: <ReloadOutlined />,
        onClick: () => refetch(),
        type: 'primary',
        ghost: true,
        size: 'large',
        style: {
            marginBottom: '16px',
        },
    }

    if (error) {
      return <div>Something went wrong...</div>
    }

    //global or specific city
    const global =
    [{ text: 'For Specific Cities', value: false },{ text: 'For All Cities', value: true }]

    //initialValues for Formik
    const initialValues = {
        title: '',
        city_id: [],
        url: '',
        global: false,
    }

    //validationSchema for Formik
    const validationSchema = yup.object({
        title: yup.string().required('Required'),
        city_id: yup.array(),
        url: yup.string().required('Required'),
        global: yup.boolean().required('Required'),
    })

    //onSubmit for Formik creating new training video
    const createTraining =  async (values) => {
            
        try {
      const auth = await Auth.currentSession()// Get current session
      const token = auth.getAccessToken().getJwtToken()// Get token from session
      const options = { // Set options for fetch
        headers: {
          Authorization: token,
          ...(process.env.REACT_APP_ENV && { 'env': process.env.REACT_APP_ENV }),
        }
      
      }
 
        
      
      const response = await API.post(`/v1/trainings/cc`, values, options)
      const data = await response.data
      if (data) {
        message.success('training video added successfully');
      }
    }
    catch (error) {
      console.log(error)
    }  
    }
 

// get cities from API

    const getCities = async () => {
        try {
            const auth = await Auth.currentSession()// Get current session
            const token = auth.getAccessToken().getJwtToken()// Get token from session
            const options = { // Set options for fetch
                headers: {
                    Authorization: token,
                    ...(process.env.REACT_APP_ENV && { 'env': process.env.REACT_APP_ENV }),
                }
            }
            const response = await API.get(`v1/cities/cc`, options)
            const data = await response.data
            if (data) {
                const cities = data.items.map((city) => {
                    city.text = city.name
                    city.value = city.id
                    return city;
                })
                setCities(cities)
            }
        }
        catch (error) {
            console.log(error)
        }
    }

//to handle disable and enable cities select
    const handleGlobal = (value) => {
        console.log(value)
        if (value === true) {

            setShowCities(false)
        }
        else {
            setShowCities(true)
        }
    }
 
    return (
        <Card title={'Trainings'} style={{ margin: 15 }}>
            <Space direction="vertical" style={{ paddingBottom: 16 }}>
                <Tooltip title="Reload data">
                    <Button {...buttonConfig} />
                </Tooltip>
                <Button
                    onClick={showModal}
                    type="primary"
                    style={{
                    marginBottom: 20,
                    
                    }}
                >
                   Add New Training
                </Button>
            </Space>
              
        <Formik
         initialValues={initialValues}
         validationSchema={validationSchema}
          onSubmit={async (values, actions) => {
                    await createTraining(values).then((response) => {
                        })
                    console.log(values)
              refetch()
               setOpen(false)
                        }}           
        >
        <Form >
        <Modal
                title="Add New City"
                visible={open}
                confirmLoading={confirmLoading}
                onCancel={handleCancel}
                footer={[
                                        <Button key="cancel" onClick={() =>  setOpen(false)}>
                                            Cancel
                                        </Button>,
                                        <SubmitWrapper key="submit" type="primary" >
                                            Add New Training Video
                                        </SubmitWrapper>,
                                    ]}              
            >
                    <Space direction='vertical' style={{ width: '100%'}}>
                            <InputWrapper type="text" name="title" placeholder="Title" />
                            <InputWrapper type="text" name="url" placeholder="Vedio Link (from YouTube)" /> 
                            <SelectWrapper name="global" placeholder="Select Privacy" datasource={global} onSelect={handleGlobal} />
                            { showCities &&  <SelectWrapper allowClear  name="city_id" placeholder="Select City" datasource={cities} mode="multiple"  /> } 
                         </Space>
                    </Modal>
                </Form>
            </Formik>
            <Table
                columns={tableColumns}
                dataSource={data?.items}
                loading={isLoading}
                rowKey={(record) => record.id}
                onRow={(record) => ({
                    onClick: () => navigate(`/training/${record.id}`)
                })}
            />
        </Card>
    )
}

export default Trainings