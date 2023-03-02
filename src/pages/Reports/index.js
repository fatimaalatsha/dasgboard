import { Icon } from '@material-ui/core';
import {
    Typography, 
    Card,
    Space,
    Table,
} from 'antd';
 
import AreaChartOutlined from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;
const { Meta } = Card;





const columns = [
            {
        title: 'Report Name',
        dataIndex: 'name',
        key: 'name',
  },
];

const data = [
  {
    key: 'conversion_rates',
    name: 'Conversion Rates',
   },
  {
    key: 'conversion_rates_per_stage',
    name: 'Conversion rates per stage',
  },
  {
    key: 'number_of_leads_per_stage',
    name: 'Number of leads per stage',
  },
  {
    key: 'number_of_leads_per_city',
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
        <Space direction="vertical" size="large">
          <Card
            title={
                <p>  <AreaChartOutlined style={{ fontSize: '16px', color: '#08c', spacing: '16px' }} /> Conversion Rates</p>
            }
            bordered={true}
            hoverable style={
            { width: 1000 }}>
            Conversion Rates per Cities
            </Card>
            <Card title="Card title" bordered={true} hoverable>
            hiiii
            </Card>
            <Card title="Card title" bordered={true} hoverable>
            Card content
            </Card>
        </Space>
        <Table columns={columns} dataSource={data}
          onRow={(record) => ({
          onClick: () => navigate(`/reports/${record.key}`)
          })}
          
        />       
        </Card>
    )
}
    
export default Reports