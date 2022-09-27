import { useState, useEffect } from 'react';

import { Card, Table } from 'antd'; // Import Ant components
import { useNavigate } from 'react-router-dom'; // Import Nav component

import useFetch from '../../hooks/use-fetch'// Import useFetch custom hook
import API from '../../api/BaseUrl'



const Drivers = () => {
  const navigate = useNavigate();
  const [cities, setCities] = useState([])
  const [argument, setArgument] = useState({
    filters: [],
  })

  const [page, setPage] = useState({
    limit: 10,
    current_page: 1,
  })

  const url = `/v1/drivers/cc?limit=${page.limit}&page=${page.current_page}${argument.filters}`
  
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

  const { data, isLoading, error, refetch } = useFetch(url)
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
      onFilter: (value, record) => { 
        return record.city?.id === value;
      },
      sorter: (record1, record2) => {
        return record1.city?.name.localeCompare(record2.city?.name);
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
        { text: 'active', value: 'active' },
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
          pageSize: page.limit,
          total: data.total_items,
        }}
        onRow={(driverRecord) => ({
          onClick: () => navigate(`driver/${driverRecord.user_id}`)
        })}
        onChange={(pagination, filters, sorter) => {
          
          console.log('params: ', pagination, filters, sorter)
          
          setPage({...page, current_page: pagination.current})
          Object.keys(filters).some(key => {
            filters[key] 
            ? setArgument({ filters: `&filter[${key}]=in|${Object.values(filters[key])}`}) 
            : setArgument({ ...argument, filters: ''})
          })
        }}
        
      />
    </Card>
  )
};

export default Drivers