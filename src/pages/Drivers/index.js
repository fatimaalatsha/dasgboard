import { Card, Table, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Auth } from 'aws-amplify';
import API from '../../api/BaseUrl';


const Drivers = () => {
  const navigate = useNavigate();
  const [dataSource, setDataSource] = useState([]);
  const [totalRecords, setTotalRecords] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRecords(1)
    console.log(Auth.currentSession())
    
  }, []);

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

  const fetchRecords = async (page) => {
    setLoading(true)
    const options = {
      headers: {
          'Authorization': 'accessToken'
      }
    }
    await API.get(`/v1/drivers/cc?page=${page}&limit=10`, options).then(response => {
      setDataSource(response.data.items)
      setTotalRecords(response.data.total_items)
      setLoading(false)
    })
  };

  return(
    <Card title={'Drivers'} style={{ margin: 15 }}>
      <Table
        dataSource={dataSource}
        columns={tableColumns}
        loading={loading}
        rowKey="user_id"
        pagination={{
          pageSize:10,
          total:totalRecords,
          onChange:(page)=>{
            fetchRecords(page);
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