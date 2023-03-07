import { Card, Table, Typography } from 'antd';
import { AreaChartOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const columns = [
  {
    title: '',
    dataIndex: 'icon',
    key: 'icon',
    width: 50,
    render: () => <AreaChartOutlined />,
  },
  {
    title: 'Report Name',
    dataIndex: 'name',
    key: 'name',
  },
];

const data = [
  {
    key: 'conversion_rates',
    name: 'Conversion Rates Per City',
  },
  {
    key: 'conversion_rates_per_stage',
    name: 'Drivers Status Per City',
  },
  {
    key: 'number_of_leads_per_stage',
    name: 'Number of Leads per Stage',
  },
  {
    key: 'number_of_leads_per_city',
    name: 'Number of Leads per City',
  },
];

const Reports = () => {
  const navigate = useNavigate();

  const handleRowClick = (record) => {
    navigate(`/reports/${record.key}`);
  };

  return (
    <Card title={<Title level={2}>Reports</Title>}>
      <Table
        columns={columns}
        dataSource={data}
        onRow={(record) => ({
          onClick: () => handleRowClick(record),
        })}
      />
    </Card>
  );
};

export default Reports;
