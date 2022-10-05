import { useState, useEffect } from 'react';

import { Card, Table,Button, Tag } from 'antd'; // Import Ant components
import { useNavigate } from 'react-router-dom'; // Import Nav component

import useFetch from '../../hooks/use-fetch'// Import useFetch custom hook
import API from '../../api/BaseUrl'



const Drivers = () => {
  const navigate = useNavigate();
  const [cities, setCities] = useState([])
  const [argument, setArgument] = useState({
    filters: [],
  })

  // Fetch data from API to help with rest filtered
  let [filteredData, setfilteredData] = useState([])
  

  //handling pagination
  const [page, setPage] = useState({
    limit: 10,
    current_page: 1,
  })


  //sorting fetched data
  const [sort, setSort] = useState({
    sorter: [],
  })

  //rest filtered data
  const [rest, setRest] = useState(false)
  
  //beased on the argument and page number fetch the data
  const url = `/v1/drivers/cc?limit=${page.limit}&page=${page.current_page}${argument.filters}${sort.sorter}`


  //handle reset
  const handleClick = async () => {
    
    console.log('click ', argument, page, sort);
    setArgument({ filters: [] });
    setSort({ sorter: [] });
    setPage({ limit: 10, current_page: 1 });
   // window.location.reload();
    // try {
    //   const response = await API.get(url)
    //   const data = await response.data
    //   if (data) {
    //     setfilteredData(data.items)
    //   }

    // }
    // catch (error) { console.log(error) } 
    
  refetch()
  };

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
//data
  useEffect(() => {
    if (data) {
      setfilteredData(data.items)
    }
  }
   , [data])

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
        return record2.city?.name.localeCompare(record1.city?.name);
      },
     
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
          {/* //restting sort and filters */}
      <Button type="primary" style={{ marginBottom: 16 }} onClick={() => {
        
        handleClick();
        //setfilteredData(data.items)
      }}>Reset</Button>
      
      <Table
        dataSource={filteredData}
        columns={tableColumns}
        loading={isLoading}
        rowKey="user_id"
        pagination={{
          pageSize: page.limit,
          total: data.total_items,
          showSizeChanger: true,
          showQuickJumper: true,
        }}
        
         
        onRow={(driverRecord) => ({
          onClick: () => navigate(`driver/${driverRecord.user_id}`)
        })}
        onChange={(pagination, filters, sorter, extra) => {
          console.log('params', extra);
          //setting sorter for cities
          if (sorter.order) { 
            setSort({
              sorter: `&sort[${sorter.column.key}]=${sorter.order === 'ascend' ? 'asc' : 'desc'}`,
             })
           }
                    
          //setting pagination 
          setPage({ ...page, current_page: pagination.current ,limit: pagination.pageSize})
          

          //setting filters
          Object.keys(filters).some(key => {
            filters[key]
              ? setArgument({ filters: `&filter[${key}]=in|${Object.values(filters[key])}` })
              : setArgument({ ...argument, filters: '' })
          }) 

          //setting rest
          if (rest === true) {
            setArgument({ filters: '' });
            setSort({ sorter: '' });
            setPage({ limit: 10, current_page: 1 });
            setRest(false)
          }
        }
        }
        
      />
    </Card>
  )
};

export default Drivers