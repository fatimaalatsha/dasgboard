import { Space, Table, Tag, Button } from 'antd'

const columns = [
    {
      title: 'ID',
      dataIndex: 'key',
      key: 'key',  
    },
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    render: (text) => <a>{text}</a>,
  },
  {
    title: 'Reliability Score',
    dataIndex: 'age',
    key: 'age',
  },
  {
    title: 'Shift Details',
    dataIndex: 'address',
    key: 'address',
  },
  {
    title: 'Action',
    key: 'action',
    render: (_, record) => (
      <Space size="middle">
        <Button danger >Reject</Button>
        <Button type="primary" >Approve</Button>
      </Space>
    ),
  },
];
const data = [
  {
    key: '1',
    name: 'John Brown',
    age: 32,
    address: 'May, Friday 19 - 2023 07:00 ➡ 08:00',
    tags: ['nice', 'developer'],
  },
  {
    key: '2',
    name: 'Jim Green',
    age: 42,
    address: 'May, Friday 19 - 2023 07:00 ➡ 08:00',
    tags: ['loser'],
  },
  {
    key: '3',
    name: 'Joe Black',
    age: 32,
    address: 'May, Friday 19 - 2023 07:00 ➡ 08:00',
    tags: ['cool', 'teacher'],
  },
]

const ShiftApproval = () => <Table columns={columns} dataSource={data} />

export default ShiftApproval