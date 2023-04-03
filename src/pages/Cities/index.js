import useFetch from '../../hooks/use-fetch'// Import useFetch custom hook
import API from '../../api/BaseUrl'
import { Auth } from 'aws-amplify'// Import Amplify auth method

import React ,{ useState, useEffect } from 'react'; // Import React
import { useNavigate } from 'react-router-dom' // Import hook from react-router

import { Card, Table, Button, Modal, Space, Tag } from 'antd'; // Import Ant components
import { Formik, Form } from 'formik'   // Import Formik form components

import * as yup from 'yup'; // Import Yup validation library
import qs from 'qs' // Import qs library

import InputWrapper from '../../components/forms/InputWrapper' // Import InputWrapper component
import SelectWrapper from '../../components/forms/SelectWrapper' // Import SelectWrapper component
import SubmitWrapper from '../../components/forms/SubmitWrapper' // Import SubmitWrapper component
import { createCity } from '../../utils/city-status'  // Import createCity function



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
  const navigate = useNavigate()
  
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
          province.text = province.name
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
  
    //get the papams that will be passed to filters through qs
  const getUserParams = (params) => ({ // Get table params
  limit: params.pagination?.pageSize,
  page: params.pagination?.current,
  ...params,
  })

  const [tableParams, setTableParams] = useState({ // Set table params
      pagination: {
      current: 1,
      pageSize: 10,
      showSizeChanger: true,
      },
  })
  //fetch data from api
  const { data, isLoading, error, refetch } = useFetch(`v1/cities/cc?${qs.stringify(getUserParams(tableParams), { skipNulls: true, arrayFormat: 'comma' })}`) // Fetch data from API
  console.log(data)
  //handle table change
  const handleTableChange = (pagination, filter, sorter) => { 
        Object.keys(filter).forEach(key => {
            if (filter[key]) {
              filter[key].unshift('in|'+ filter[key][0])
              filter[key].splice(1, 1)
            }
          })
        setTableParams({
            pagination,
            filter,
            ...(Object.keys(sorter).length !== 0 && {sort: {
                [`${sorter.columnKey === 'c.id' ? 'city' : sorter.columnKey}`]: sorter.order === 'ascend' ? 'asc' : 'desc',
            }}),
        })
  }
  
  useEffect(() => {
    let isMounted = true
    setTableParams({// Set table params
        ...tableParams,
        pagination: {
            ...tableParams.pagination,
            total: data?.total_items,
        }
    }) 
    if (isMounted) {
      getProvince()
    }
    return () => { isMounted = false }
  }, [data])

  
// validate schema for form
  const validationSchema = yup.object({
    province_id: yup.string()
      .required('Required'),
    name: yup.string()
      .required('Required'),
    email: yup.string()
      .email('Please Enter A Aalid Email Address!').required('Please type your valid email address!'),
    status: yup.string()
      .required('please select status'),
    min_age: yup.number()
      .typeError('Minimum Age Should be A Number!')
      .required('Required').positive('Minimum Age Should be A Positive Number!')
      .integer()
      .max(99, 'Minimum Age Should be Two-Digit Number!'),
    vehicle_age: yup.number()
      .typeError('Minimum Age Should be A Number!')
      .required('Required')
      .positive('Minimum Age Should be A Positive Number!')
      .integer()
      .max(99, 'Minimum Age Should be A Two-Digit Number!'),
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
    return <>Something went wrong...</>
  }

  const columns = [
      {
          title: 'City Name',
          dataIndex: 'name',
          key: 'province_id',
          filters: provinces,
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        align: 'center',
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
      },
      {
          title: 'Minimum Age',
          dataIndex: 'min_age',
          key: 'min_age',
          align: 'right',

      },
      {
          title: 'Vehicle Age',
          dataIndex: 'vehicle_age',
          key: 'vehicle_age',
          align: 'right',
                      
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
              destroyOnClose = {true}
              open={open}
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
                    <SelectWrapper type="text" name="province_id" datasource={provinces} placeholder="Province" />
                    <InputWrapper type="text" name="name" placeholder="City Name" />
                    <InputWrapper type="text" name="email" placeholder="City Email" />
                    <SelectWrapper type="text" datasource={status} name="status" placeholder="Status" />
                    <InputWrapper type="text" name="min_age" placeholder="Driver Minimum Age" />
                    <InputWrapper type="text" name="vehicle_age" placeholder="Maximum Vehicle Age" />
                  </Space>
                </Modal>
              </Form>
            </Formik>
          
          <Table
          dataSource={data.items}
          columns={columns}
          loading={isLoading}
          pagination={tableParams.pagination}
          sortDirections={['ascend', 'descend', 'ascend']}
          onChange={handleTableChange}
          rowClassName={() => 'clickable-row'}
          rowKey={(record) => record.city_id}
          onRow={(record) => ({
                  onClick: () => navigate(`/city/${record.city_id}`)
        })}
          />      
    </Card>
  )
}

export default Cities