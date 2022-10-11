import { useState, useEffect } from 'react';

import { Card, Table,Button, Tag } from 'antd'; // Import Ant components
import { useNavigate } from 'react-router-dom'; // Import Nav component

import useFetch from '../../hooks/use-fetch'// Import useFetch custom hook
import API from '../../api/BaseUrl'

import qs from 'qs' // Import qs library

  //get the papams that will be passed to filters through qs
  const getUserParams = (params) => ({ // Get table params
  limit: params.pagination?.pageSize,
  page: params.pagination?.current,
  ...params,
})
const Drivers = () => {
  const navigate = useNavigate();
  const [cities, setCities] = useState([])
// get table data 
  const [tableParams, setTableParams] = useState({ // Set table params
      pagination: {
      current: 1,
      pageSize: 20,
      showSizeChanger: true,
      },
  })
  
  // Fetch Cities list from API
  const getCities = async () => {
    try { 
      const response = await API.get('/v1/cities')
      const data = await response.data
      if (data) {
        const cities = data.items.map((city) => {
          city.value = city.city_id
          city.text = city.name
          delete city.name
          return city;
        })
        setCities(cities)
      }
    }
    catch (error) {
      console.log(error)
    }  
  }
 
  useEffect(() => {
    let isMounted = true
    if (isMounted) {
      getCities()
    }
    return () => { isMounted = false }
}, [])

  const { data, isLoading, error, refetch } = useFetch(`/v1/drivers/cc?${qs.stringify(getUserParams(tableParams), { skipNulls: true, arrayFormat: 'comma' })}`) // Fetch data from API//data
  const handleTableChange = (pagination, filter, sorter) => { // Handle table change
    Object.keys(filter).forEach(key => {
      if (filter[key]) {
        filter[key].unshift('in|' + filter[key][0])
        filter[key].splice(1, 1)
        console.log(sorter)
      }
    })
     
    
    setTableParams({
        pagination,
        filter,
      ...(Object.keys(sorter).length !== 0 && {
        sort: {
        
                [`${sorter.columnKey === 'city_id' ? 'city' : sorter.columnKey}`]: sorter.order === 'ascend' ? 'asc' : 'desc',
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
      getCities()
    }
    return () => { isMounted = false }
}, [data])

  const tableColumns = [
    {
      title: 'First Name',
      dataIndex: 'first_name',
      key: 'first_name'
    },
    {
      title: 'Last Name',
      dataIndex: 'last_name',
      key: 'last_name'
    },
    {
      title: 'phone',
      dataIndex: 'phone',
      key: 'phone',
      responsive: ['md'],
    },
    {
      
      title: 'city',
      dataIndex: ['city', 'name'],
      key: 'city_id',
      filters: cities,
      sorter: true,
      
          
    },
    {
      title: 'email',
      dataIndex: 'email',
      key: 'email',
      responsive: ['lg'],
    },
    {
      title: 'status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        return (
          <Tag color={status === 'active' ? 'success' : status === 'inactive' ? 'error' : 'warning'}>
          {status}
          </Tag>
        );
      }
      ,
      filters: [
        {text:'onboard', value: 'onboard' },
        { text: 'pending', value: 'pending' },
        { text: 'inactive', value: 'inactive' },
        { text: 'active', value: 'active' },
      ],
    }
  ];

  if (error) {
    return <div>Something went wrong...</div>
  }

  return(
    <Card title={'Drivers'} style={{ margin: 15 }}>
      <Table
        dataSource={data.items}
        columns={tableColumns}
        loading={isLoading}
        rowKey="user_id"
        pagination={tableParams.pagination}
        onChange={handleTableChange}
        onRow={(driverRecord) => ({
        onClick: () => navigate(`driver/${driverRecord.user_id}`)
        })}
      />
    </Card>
  )
};

export default Drivers