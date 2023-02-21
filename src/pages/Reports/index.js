import {
    Typography, 
    Card,
    Space,
    Table,
} from 'antd';

import { useNavigate } from 'react-router-dom';

const { Title } = Typography;





const columns = [
            {
        title: 'Report Name',
        dataIndex: 'name',
        key: 'name',
  },
];

const data = [
  {
    key: '1',
    name: 'Conversion Rates',
   },
  {
    key: '2',
    name: 'Conversion rates per stage',
  },
  {
    key: '3',
    name: 'Number of leads per stage',
  },
  {
    key: '4',
    name: 'Number of leads per city',
  },
];

const Reports = () => {
  const navigate = useNavigate()

    return (
        <Card
         title={
                <Space align="start">
                    <Title>Reports</Title>
                </Space>
            }
      >

        <Table columns={columns} dataSource={data}
          onRow={(record) => ({
          onClick: () => navigate(`/reports/${record.key}`)
          })}
          
        />       
        </Card>
    )
}
    
export default Reports