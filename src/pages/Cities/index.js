import useFetch from '../../hooks/use-fetch'// Import useFetch custom hook
import { Card, Table, Button, Modal, Space, Tag} from 'antd';
import React ,{ useState } from 'react';
import { Formik, Form } from 'formik'   // Import Formik form components
import InputWrapper from '../../components/forms/InputWrapper'
import SelectWrapper from '../../components/forms/SelectWrapper'
import SubmitWrapper from '../../components/forms/SubmitWrapper'
import * as yup from 'yup';
import API from '../../api/BaseUrl'
import { Auth } from 'aws-amplify'// Import Amplify auth method
import { createCity } from '../../utils/city-status'

const Cities = () => {

  const [open, setOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const showModal = () => {
    setOpen({...open, modal: true})
    getProvince();

  };
  
  const handleCancel = () => {
    setOpen(false);
    
  };

  const status = [{ label: 'active', value: 'active' }, { label: 'inactive', value: 'inactive' }]
  const [provinces, setProvinces] = useState([])

  
   // Fetch getProvince list from API
  const getProvince = async () => {
    try {
      const auth = await Auth.currentSession()// Get current session
      const token = auth.getAccessToken().getJwtToken()// Get token from session
      const options = { // Set options for fetch
        headers: {
          Authorization: token,
          ...(process.env.REACT_APP_ENV && { 'env': process.env.REACT_APP_ENV }),
        }
      
      }
      const response = await API.get(`/v1/provinces`, options)
      const data = await response.data
      if (data) {
        const provinces = data.items.map((province) => {
          province.value = province.id
          return province;
        })
        setProvinces(provinces)
       
      }
    }
    catch (error) {
      console.log(error)
    }  
  }
  

    //fetch data from api
  const { data, isLoading, error, refetch } = useFetch(`v1/cities/cc`) // Fetch data from API
// validate schema for form
  const validationSchema = yup.object({
 province_id:  yup.string().required('Required'),
        name: yup.string().required('Required'),
    email: yup.string().email('Please Enter A Aalid Email Address!').required('Please type your valid email address!'),
      status: yup.string().required('please select status'),
     min_age:  yup.number().required('Minmum Age Should Be A Number ').positive().integer(),
 vehicle_age: yup.number().required('Required').positive().integer(),
  })
   
  const initialValues = {
    name: '',
    province_id:'',
    min_age: '',
    vehicle_age: '',
    email: '',
    status: '', 
  }
  

    if (error) {
    return <div>Something went wrong...</div>
     }
    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name),
        },
         {
          title: 'Status',
          dataIndex: 'status',
          key: 'status',
           render: (status) =>
             <Tag color={status === 'active' ? 'green' : status === 'inactive' ? 'volcano' : 'orange'}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
             </Tag>,
          filters: [
             {
               text: 'Active',
               value: 'active',
             },
             {
               text: 'Inactive',
                value: 'inactive',
             },
           ],
           onFilter: (value, record) => record.status.indexOf(value) === 0,
        },
          {
            title: 'Minmum Age',
            dataIndex: 'minAge',
            key: 'minAge',
        },
        {
            title: 'Vehicle Age',
            dataIndex: 'vehicleAge',
            key: 'vehicleAge',
      },        
    ]
    return (
      <Card title={'Cities'} style={{ margin: 15 }}>
            <Button
                onClick={showModal}
                type="primary"
                style={{
                  marginBottom: 20,
                  
                }}
               >
                Add a New City
            </Button>
          
        <Formik
        initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={async (values, actions) => {
                    await createCity(values).then((response) => {
                      if (response) {
                        actions.resetForm({
                          values: {
                            name: '',
                            province_id: '',
                            min_age: '',
                            vehicle_age: '',
                            email: '',
                            status: '',
                          }
                        })
                        refetch()
                        }
                      setOpen(false)
                    })
         }}           
        >
                <Form > 
            <Modal
                title="Add New City"
                destroyOnClose={true}
                visible={open}
                confirmLoading={confirmLoading}
                onCancel={handleCancel}
                footer={[
                                        <Button key="cancel" onClick={() =>  setOpen(false)}>
                                            Cancel
                                        </Button>,
                                        <SubmitWrapper key="submit" type="primary" >
                                            Add City
                                        </SubmitWrapper>,
                                    ]}

                    >
                    <Space direction='vertical' style={{ width: '100%'}}>
                      <SelectWrapper type="text" name="province_id" datasource={provinces} placeholder="Province Name" />
                      <InputWrapper type="text" name="name" placeholder="City Name" />
                      <InputWrapper type="text" name="email" placeholder="City Email" />
                      <SelectWrapper type="text" datasource={status} name="status" placeholder="Status" />
                      <InputWrapper type="text" name="min_age" placeholder="Driver Minimum Age" />
                      <InputWrapper type="text" name="vehicle_age" placeholder="Vehicle Max Manufacturing Date" />
                    </Space>
                  </Modal>
                </Form>
              </Formik>
           
            <Table
            dataSource={data.items}
            columns={columns}
            loading={isLoading}
            rowKey={(record) => record.city_id}
            />      
      </Card>
    )
}

export default Cities