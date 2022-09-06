import { useState } from 'react';

import { Card, Table } from 'antd'; // Import Ant components
import { useNavigate } from 'react-router-dom'; // Import Nav component

import useFetch from '../../hooks/use-fetch'// Import useFetch custom hook


const Drivers = () => {
  const navigate = useNavigate();
  const [argument, setArgument] = useState({
    page: 1,
    limit: 10,
    current_page: 1,
  })

  const { data, isLoading, error } = useFetch(`/v1/drivers/cc?page=${argument.page}&limit=${argument.limit}`)// Call useFetch custom hook

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
      title: 'address',
      dataIndex: 'address',
      key: 'address',
      responsive: ['xl'],
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
      sorter:(record1, record2) =>{
        return record1.status.localeCompare(record2.status)
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
            console.log(page)
            setArgument({ ...argument, page: page + 1})// Set argument state
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