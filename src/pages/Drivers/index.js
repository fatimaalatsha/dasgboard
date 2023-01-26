import { useState, useEffect, useRef } from 'react';

import { Card, Table, Tag, Button, Space, Input, Tooltip,} from 'antd'; // Import Ant components
import { ReloadOutlined } from '@ant-design/icons' // Import Ant Icons
import { useNavigate } from 'react-router-dom'; // Import Nav component

import useFetch from '../../hooks/use-fetch'// Import useFetch custom hook
import API from '../../api/BaseUrl'

import qs from 'qs' // Import qs library
import dayjs from "dayjs"// Import date handlers
import utc from 'dayjs/plugin/advancedFormat' // Import dayjs utc plugin

import { useFilterStore } from '../../store' // Import filter store

  //get the papams that will be passed to filters through qs
  const getUserParams = (params) => ({ // Get table params
    limit: params.pagination?.pageSize,
    page: params.pagination?.current,
    ...params,
})

dayjs.extend(utc) 

const DocumentOverview = (props) => { // Document Overview component
  return (
    <Space>
      {
        Object.keys(props).map((key, idx) => {
          const value = props[key]
          return (
            <Space key={idx} >
            { key !== 'missing' && 
              <Tooltip  title={key === 'action' ? 'Action Required' : key} overlayInnerStyle={{ textTransform: 'capitalize' }}>
                <Tag color={key === 'rejected' ? 'red' : key === 'approved' ? 'green' : 'blue'} >
                  {value}
                </Tag>
              </Tooltip>
            }
            </Space>
          )
        })
      }
    </Space>
  )
}

const Drivers = () => {
  const driverFilter = useFilterStore((state) => state.driverFilter) // Get filter from store
  const setDriverFilter = useFilterStore((state) => state.setDriverFilter) // Set filter to store
  const componentIsMounted = useRef(false) // Create a ref to store the component mount state

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
      pagination: {
        ...driverFilter.pagination,
        ...pagination,
      },
      filter: {
        ...filter,
        ...(driverFilter.filter?.city_id && filter.city_id && filter.city_id[0] === 'in|undefined' &&  { city_id: driverFilter.filter?.city_id } ),
        ...(filter.status === null && { status: ['in|active', 'inactive'] } ),
      },
      ...(Object.keys(sorter).length !== 0 && {
        sort: {
            [`${sorter.columnKey === 'city_id' ? 'name' : sorter.columnKey}`]: sorter.order === 'ascend' ? 'asc' : 'desc',
        }
      }),
    })
  }
  
  const handleSearch = (selectedKeys) => {
    const regex = /^(?:\s|[\d]|\W)+$/g // TODO: Should be validated on the backend, temporary solution
    const found = selectedKeys ? selectedKeys[0]?.match(regex) : null // Check if search value is a number or space
    setDriverFilter({
      full_name: selectedKeys && !found ? selectedKeys[0] : null,
      pagination: {
        ...driverFilter.pagination,
        current: 1,
      }
    })
    selectedKeys ?? setSearchText('')
  }
  
  useEffect(() => {
    if(!componentIsMounted.current) { // Check if component is mounted
      setDriverFilter({ // Set filter to store
        pagination: {
          ...driverFilter.pagination,
          total: data?.total_items,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} Drivers`,
        }
      })
      getCities()
    }

    return () => {
        componentIsMounted.current = true // Set the component mount state to false on component unmount
    }
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
    type: 'text',
    onChange: (e) => setSearchText(e.target.value ? [e.target.value] : []),
    onPressEnter: () => handleSearch(searchText),
    style: {
      marginBottom: 8,
      width: 'calc(50% - 80px)',
    }
  }

  /* Added filteredValue: null to the columns that are not filtered to avoid a warning with controlled and uncontrolled columns
  * https://github.com/ant-design/ant-design/issues/28107
  */
  const tableColumns = [
  {
      title: 'ID',
      dataIndex: 'user_id',
      key: 'user_id',
      sorter: true,
      align: 'center',
      ...( driverFilter.sort?.user_id && { defaultSortOrder: driverFilter.sort?.user_id === 'asc' ? 'ascend' : 'descend' }),
      filteredValue: null,
    },
    {
      title: 'First Name',
      dataIndex: 'first_name',
      key: 'first_name',
      sorter: true,
      ...( driverFilter.sort?.first_name && { defaultSortOrder: driverFilter.sort?.first_name === 'asc' ? 'ascend' : 'descend' }),
      filteredValue: null,
    },
    {
      title: 'Last Name',
      dataIndex: 'last_name',
      key: 'last_name',
      filteredValue: null,
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      responsive: ['md'],
      filteredValue: null,
    },
    {
      
      title: 'City',
      dataIndex: ['city_name'],
      key: 'city_id',
      filters: cities,
      sorter: true,
      filterSearch: true,   
      filteredValue: null,
      ...( driverFilter.sort?.name && { defaultSortOrder: driverFilter.sort?.name === 'asc' ? 'ascend' : 'descend' }),
      ...( driverFilter.filter?.city_id && { filteredValue: driverFilter.filter?.city_id.map((city, index) => index === 0 ? city.replace('in|', '') : city.toString()) }),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      responsive: ['lg'],
      filteredValue: null,
    },
    {
      title: 'Document Overview',
      dataIndex: 'documents',
      key: 'documents',
      render: (documents) => {
        return (
          <DocumentOverview {...documents} />
        )
      }
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {                                                                           
        return (
          <Tag color={status === 'active' ? 'success' : 'error' }>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Tag>
        );
      }
      ,
      filters: [
        { text: 'Inactive', value: 'inactive' },
        { text: 'Active', value: 'active' },
      ],
      filteredValue: null,
      ...( driverFilter.filter?.status && { filteredValue: driverFilter.filter?.status.map((status) => status.replace('in|', '')) }),
    },
    {
        title: 'Applied Date',
        dataIndex: 'created_at',
        render: (text, record) => `${dayjs(text).format('YYYY-MM-DD - HH:mm:ss')}`,
        align: 'right',
        sorter: true,
        key: 'created_at',
        filteredValue: null,
        ...( driverFilter.sort?.created_at && { defaultSortOrder: driverFilter.sort?.created_at === 'asc' ? 'ascend' : 'descend' }),
    },
  ];

  if (error) {
    return <div>Something went wrong...</div>
  }

  
  return(
    <Card title={'Drivers'} style={{ margin: 15 }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
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