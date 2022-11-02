import { useState, useEffect, useRef } from 'react';

import { Card, Table, Tag, Button, Space, Input, Tooltip } from 'antd'; // Import Ant components
import { ReloadOutlined } from '@ant-design/icons' // Import Ant Icons
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
  const [searchText, setSearchText] = useState('');
  const searchInput = useRef(null) // Get search input
  
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

  const { data, isLoading, error, refetch } = useFetch(`/v1/drivers/cc?${qs.stringify(getUserParams(tableParams), { skipNulls: true, arrayFormat: 'comma' })}`) // Fetch data from API//data
  
  const handleTableChange = (pagination, filter, sorter) => { // Handle table change
    Object.keys(filter).forEach(key => {
      if (filter[key]) {
        filter[key].unshift('in|' + filter[key][0])
        filter[key].splice(1, 1)
      }
    })
     
    setTableParams({
      ...tableParams,
        pagination,
        filter,
      ...(Object.keys(sorter).length !== 0 && {
        sort: {
           [`${sorter.columnKey === 'city_id' ? 'name' : sorter.columnKey}`]: sorter.order === 'ascend' ? 'asc' : 'desc',
        }
      }),
    })
  }
  
  const handleSearch = (selectedKeys) => {
    setTableParams({
      ...tableParams,
      full_name: selectedKeys ? selectedKeys[0] : null,
      pagination: {
        current: 1,
      }
    })
    selectedKeys ?? setSearchText('')
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

  const refetchConfig = {
      icon: <ReloadOutlined />,
      onClick: () => refetch(),
      type: 'primary',
      ghost: true,
      size: 'large',
      style: {
          marginBottom: '16px',
      },
  }

  const searchConfig = {
    placeholder: "Full Name Search",
    addonBefore: <Button type="text" size="small" onClick={() => handleSearch(null)}>Clear</Button>,
    value: searchText,
    onChange: (e) => setSearchText(e.target.value ? [e.target.value] : []),
    onPressEnter: () => handleSearch(searchText),
    style: {
      marginBottom: 8,
      width: 'calc(50% - 80px)',
    }
  }

  const tableColumns = [
    {
      title: 'First Name',
      dataIndex: 'first_name',
      key: 'first_name',
      sorter: true,
    },
    {
      title: 'Last Name',
      dataIndex: 'last_name',
      key: 'last_name'
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      responsive: ['md'],
    },
    {
      
      title: 'City',
      dataIndex: ['city_name'],
      key: 'city_id',
      filters: cities,
      sorter: true,
      filterSearch: true,          
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      responsive: ['lg'],
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {                                                                           
        return (
          <Tag color={status === 'active' ? 'success' : status === 'inactive' ? 'error' : status=== 'pending' ? 'orange': 'blue' }>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Tag>
        );
      }
      ,
      filters: [
        {text:'onboard', value: 'onboard' },
        { text: 'Pending', value: 'pending' },
        { text: 'Inactive', value: 'inactive' },
        { text: 'Active', value: 'active' },
      ],
    }
  ];

  if (error) {
    return <div>Something went wrong...</div>
  }

  
  return(
    <Card title={'Drivers'} style={{ margin: 15 }}>
      <Space direction="vertical" style={{ padding: 8, display: 'flex' }}>
        <Tooltip title="Reload data">
            <Button {...refetchConfig} />
        </Tooltip>
        <Input.Group compact>
          <Input {...searchConfig}/>
          <Button type="primary" onClick={() => handleSearch(searchText)}>Search</Button>
        </Input.Group>
      </Space>
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