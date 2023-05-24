import { Space, Table, Tag, Button } from 'antd'

import dayjs from 'dayjs' // Import dayjs
import utc from 'dayjs/plugin/utc' // Import dayjs utc plugin
import timezone from 'dayjs/plugin/timezone' // Import dayjs timezone plugin

import qs from 'qs' // Import qs library

import useFetch from '../../../hooks/use-new-fetch'
import { useFilterStore } from '../../../store'

dayjs.extend(utc)
dayjs.extend(timezone)

//get the papams that will be passed to filters through qs
const queryHandler = (params) => ({ // Get table params
    city_id: params.city_id,
    date_from: params.date_from,
    date_to: params.date_to,
    paginated: false,
})

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
const oldData = [
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

const ShiftApproval = ({ selectedWeek, tz }) => {
  dayjs.tz.setDefault(tz)
  const scheduleFilter = useFilterStore(state => state.scheduleFilter)
  const filters = {
      city_id: Number(scheduleFilter.filter.city_id.replace('in|', '')),
      date_from: selectedWeek.startOf('week').format('YYYY-MM-DD'),
      date_to: selectedWeek.endOf('week').format('YYYY-MM-DD'),
  }
  const { data, isLoading, error, refetch } = useFetch(`/v1/shifts?${qs.stringify(queryHandler(filters), { skipNulls: true, arrayFormat: 'comma' })}`)
  

  error && <>Something went wrong...</>

  console.log(data)

  return (
    <Table columns={columns} dataSource={oldData} />
  )
}

export default ShiftApproval