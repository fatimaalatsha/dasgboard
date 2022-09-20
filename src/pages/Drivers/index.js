import { useState, useEffect } from 'react';

import { Card, Table } from 'antd'; // Import Ant components
import { useNavigate } from 'react-router-dom'; // Import Nav component

import useFetch from '../../hooks/use-fetch'// Import useFetch custom hook
import API from '../../api/BaseUrl'


const Drivers = () => {
  const navigate = useNavigate();
  const [cities, setCities] = useState([])
  const [argument, setArgument] = useState({
    page: 1,
    limit: 10,
    current_page: 1,
  })

  
  const getCities = async () => {
    try { 
      const response = await API.get('/v1/cities')
      const data = await response.data
      if (data) {
        const cities = data.items.map((city) => {
          city.value = city.name
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

  
  const { data, isLoading, error, refetch } = useFetch(`/v1/drivers/cc?page=${argument.page}&limit=${argument.limit}`)// Call useFetch custom hook
  const tableColumns = [
    {
      title: 'User ID',
      dataIndex: 'user_id',
      key: 'user_id'
    },
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
      key: 'city',
      filters: cities, 
      onFilter: (value, record) => {
      return record.city?.name === value;
      },
      sorter: (record1, record2) => {
        return record1.city?.id < record2.city?.id;
      }
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
      filters: [
        {text:'onboard', value: 'onboard' },
        { text: 'pending', value: 'pending' },
        { text: 'inactive', value: 'inactive' },
      ], 
      onFilter: (value, record) => {
        return record.status === value;
      }
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
        pagination={{
          pageSize: argument.limit,
          total: data.total_items,
          onChange:(page)=>{
            setArgument({ ...argument, page: page})// Set argument state
          }
        }}
        onRow={(driverRecord) => ({
          onClick: () => navigate(`driver/${driverRecord.user_id}`)
        })}
      />
    </Card>
  )
};

export default Drivers