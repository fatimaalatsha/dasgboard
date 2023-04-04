import useNewFetch from '../../hooks/use-new-fetch' // Import new endpoint hook

import { useState, useEffect } from 'react'; // Import React
import { useNavigate } from 'react-router-dom' // Import hook from react-router

import { Card, Table, Button, Modal, Space, Tag, message} from 'antd'; // Import Ant components
import { Formik, Form } from 'formik'   // Import Formik form components

import {string, number, object} from 'yup'; // Import Yup validation library
import qs from 'qs' // Import qs library

import InputWrapper from '../../components/forms/InputWrapper' // Import InputWrapper component
import SelectWrapper from '../../components/forms/SelectWrapper' // Import SelectWrapper component
import SubmitWrapper from '../../components/forms/SubmitWrapper' // Import SubmitWrapper component
import { createCity, getProvince } from '../../utils/city-status'  // Import createCity function



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
  const getPronvices = async () => {
    await getProvince().then((response) => {
      setProvinces(response)
    })
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
  const { data, isLoading, error, refetch } = useNewFetch(`v1/cities?${qs.stringify(getUserParams(tableParams), { skipNulls: true, arrayFormat: 'comma' })}`) // Fetch data from API
  
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
            total: data.meta?.total_items,
        }
    }) 
    if (isMounted) {
      getPronvices()
    }
    return () => { isMounted = false }
  }, [data])

  
// validate schema for form
  const validationSchema = object().shape({
    province_id: number().required('Required'),
    name: string().required('Required'),
    email: string()
          .email('Please type a valid Email Address!')
          .required('Required!'),
    status: string().required('please select status'),
    min_age: number()
            .positive('Positive Number Only!')
            .max(99, 'Minimum Age Should be Two-Digit Number!')
            .required('Required'),
    vehicle_age: number()
                .positive('Positive Number Only!')
                .max(99, 'Minimum Age Should be A Two-Digit Number!')
                .required('Required'),
  })
   
  const initialValues = {
    name: '',
    province_id: null,
    min_age: null,
    vehicle_age: null,
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
          console.log(values)
          await createCity({...values, min_age: Number(values.min_age), vehicle_age: Number(values.vehicle_age)}).then((response) => {
            if (response) {
              actions.resetForm()
              message.success('City created successfully');
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
                  <SelectWrapper name="province_id" datasource={provinces} placeholder="Province" />
                  <InputWrapper name="name" type="text" placeholder="City Name" />
                  <InputWrapper name="email" type="text" placeholder="City Email" />
                  <SelectWrapper name="status" datasource={status} placeholder="Status" />
                  <InputWrapper name="min_age" type="number" placeholder="Driver Minimum Age" />
                  <InputWrapper name="vehicle_age" type="number" placeholder="Maximum Vehicle Age" />
                </Space>
          </Modal>
        </Form>
      </Formik>
          
          <Table
          dataSource={data.data}
          columns={columns}
          loading={isLoading}
          pagination={tableParams.pagination}
          sortDirections={['ascend', 'descend', 'ascend']}
          onChange={handleTableChange}
          rowClassName={() => 'clickable-row'}
          rowKey={(record) => record.id}
          onRow={(record) => ({
                  onClick: () => navigate(`/city/${record.id}`)
        })}
          />      
    </Card>
  )
}

export default Cities