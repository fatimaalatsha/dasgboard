import { useState, useEffect } from 'react';

import { Card, Table, Tag, Button, Space, Input, Tooltip,Statistic, Row,Col} from 'antd'; // Import Ant components
import { ReloadOutlined } from '@ant-design/icons' // Import Ant Icons
import { useNavigate } from 'react-router-dom'; // Import Nav component

import useFetch from '../../hooks/use-fetch'// Import useFetch custom hook
import API from '../../api/BaseUrl'

import qs from 'qs' // Import qs library
import dayjs from "dayjs"// Import date handlers
import utc from 'dayjs/plugin/advancedFormat' // Import dayjs utc plugin

import { useFilterStore } from '../../store' // Import filter store
import { CheckCircleOutlined, BarChartOutlined } from '@ant-design/icons'

  //get the papams that will be passed to filters through qs
  const getUserParams = (params) => ({ // Get table params
    limit: params.pagination?.pageSize,
    page: params.pagination?.current,
    ...params,
})
dayjs.extend(utc)

const Drivers = () => {
  const driverFilter = useFilterStore((state) => state.driverFilter) // Get filter from store
  const setDriverFilter = useFilterStore((state) => state.setDriverFilter) // Set filter to store

  const navigate = useNavigate();
  const [cities, setCities] = useState([])
  const [searchText, setSearchText] = useState( driverFilter.full_name || '');
  
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
  const { data, isLoading, error, refetch } = useFetch(`/v1/drivers/cc?${qs.stringify(getUserParams(driverFilter), { skipNulls: true, arrayFormat: 'comma' })}`) // Fetch data from API//data
  const handleTableChange = (pagination, filter, sorter) => { // Handle table change
    Object.keys(filter).forEach(key => {
      if (filter[key]) {
        filter[key].unshift('in|' + filter[key][0])
        filter[key].splice(1, 1)
      }
    })
  
    setDriverFilter({ // Set filter to store
      pagination,
      filter: {
        ...filter,
        ...(driverFilter.filter?.city_id && filter.city_id && filter.city_id[0] === 'in|undefined' &&  { city_id: driverFilter.filter?.city_id } ),
      },
      ...(Object.keys(sorter).length !== 0 && {
        sort: {
            [`${sorter.columnKey === 'city_id' ? 'name' : sorter.columnKey}`]: sorter.order === 'ascend' ? 'asc' : 'desc',
        }
      }),
    })
  }
  
  const handleSearch = (selectedKeys) => {
    setDriverFilter({
      full_name: selectedKeys ? selectedKeys[0] : null,
      pagination: {
        ...driverFilter.pagination,
        current: 1,
      }
    })
    selectedKeys ?? setSearchText('')
  }
  
  
  useEffect(() => {
    let isMounted = true
    setDriverFilter({ // Set filter to store
      pagination: {
        ...driverFilter.pagination,
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
      title: 'ID',
      dataIndex: 'user_id',
      key: 'user_id',
      sorter: true,
      align: 'center',
      ...( driverFilter.sort?.user_id && { defaultSortOrder: driverFilter.sort?.user_id === 'asc' ? 'ascend' : 'descend' }),
    },
    {
      title: 'First Name',
      dataIndex: 'first_name',
      key: 'first_name',
      sorter: true,
      ...( driverFilter.sort?.first_name && { defaultSortOrder: driverFilter.sort?.first_name === 'asc' ? 'ascend' : 'descend' }),
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
      ...( driverFilter.filter?.city_id && { defaultFilteredValue: driverFilter.filter?.city_id.map((city, index) => index === 0 ? city.replace('in|', '') : city.toString()) }),       
      ...( driverFilter.sort?.name && { defaultSortOrder: driverFilter.sort?.name === 'asc' ? 'ascend' : 'descend' }),
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
        { text:'Onboard', value: 'onboard' },
        { text: 'Pending', value: 'pending' },
        { text: 'Inactive', value: 'inactive' },
        { text: 'Active', value: 'active' },
      ],
      ...( driverFilter.filter?.status && { defaultFilteredValue: driverFilter.filter?.status.map((status) => status.replace('in|', '')) }),
    },
    {
        title: 'Applied Date',
        dataIndex: 'created_at',
        render: (text, record) => `${dayjs(text).format('YYYY-MM-DD - HH:mm:ss')}`,
        align: 'right',
        sorter: true,
        key: 'created_at',
        ...( driverFilter.sort?.created_at && { defaultSortOrder: driverFilter.sort?.created_at === 'asc' ? 'ascend' : 'descend' }),
    },
  ];

  if (error) {
    return <div>Something went wrong...</div>
  }

  
  return(
    <Card title={'Drivers'} style={{ margin: 15 }}>
      <Row>
        <Col span={18}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Tooltip title="Reload data">
                <Button {...refetchConfig} />
            </Tooltip>
            <Input.Group compact>
              <Input {...searchConfig}/>
              <Button type="primary" onClick={() => handleSearch(searchText)}>Search</Button>
                </Input.Group>
            </Space>
        </Col>
        <Col span={6}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Card title={ <Statistic
                                value={data.total_items}
                                title="Total Number of Drivers"
                                valueStyle={{ color: '#0c6609' }}
                              />}
                      style={{ width: '200px' , height: '150px'}}
                      align="center"
                >
                <Statistic
                  value={data.pages}
                  title="Total Pages"
                  valueStyle={{ color: '#115c9e' }}
                />
                </Card>
        </Space>
        </Col>
      </Row>
      <Table
        dataSource={data.items}
        columns={tableColumns}
        loading={isLoading}
        rowKey="user_id"
        pagination={driverFilter.pagination}
        onChange={handleTableChange}
        rowClassName={() => 'clickable-row'}
        onRow={(driverRecord) => ({
        onClick: () => navigate(`driver/${driverRecord.user_id}`)
        })}
      />
    </Card>
  )
};

export default Drivers