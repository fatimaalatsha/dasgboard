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
      dataIndex: 'user_id',
      key: 'user_id',  
    },
    {
      title: 'Driver',
      dataIndex: 'user',
      key: 'full_name',
      render: (user) => <>{`${user.first_name} ${user.last_name}`}</>,
    },
    {
      title: 'City',
      dataIndex: ['shift', 'city', 'name'],
      key: 'name',
    },
    {
      title: 'Shift Details',
      dataIndex: 'shift',
      key: 'shift_details',
      render: (shift) => <>{`${dayjs(shift.start_time).utc().format('MMM, dddd DD - YYYY HH:mm')} ➡ ${dayjs(shift.end_time).utc().format('HH:mm')}`}</>,
    },
    {
      title: 'Shift Status',
      dataIndex: ['shift', 'status'],
      key: 'status',
      render: (status) => <Tag style={{ textTransform: 'capitalize' }} color={status === 'active' ? 'green' : status === 'rejected' ? 'red' : 'blue'}>{status}</Tag>,
    },
    {
      title: 'Application Status',
      dataIndex: 'status',
      key: 'app_status',
      render: (app_status) => <Tag style={{ textTransform: 'capitalize' }} color={app_status === 'approved' ? 'green' : app_status === 'rejected' ? 'red' : 'orange'}>{app_status}</Tag>,
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button danger size="small">Reject</Button>
          <Button type="primary" size="small">Approve</Button>
        </Space>
      ),
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
  const { data, isLoading, error, refetch } = useFetch(`/v1/shifts/applications?${qs.stringify(queryHandler(filters), { skipNulls: true, arrayFormat: 'comma' })}`)
  

  error && <>Something went wrong...</>

  return (
    <Table 
    columns={columns} 
    dataSource={data.data} 
    loading={isLoading}
    rowKey="id"
    />
  )
}

export default ShiftApproval