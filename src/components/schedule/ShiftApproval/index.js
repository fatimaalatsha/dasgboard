import { useState } from 'react'
import { Space, Typography, Switch, Table, Tag, Button, Popconfirm, message, Result } from 'antd'
import { QuestionCircleOutlined } from '@ant-design/icons'

import dayjs from 'dayjs' // Import dayjs
import utc from 'dayjs/plugin/utc' // Import dayjs utc plugin
import timezone from 'dayjs/plugin/timezone' // Import dayjs timezone plugin

import qs from 'qs' // Import qs library

import useFetch from '../../../hooks/use-new-fetch'
import { useFilterStore } from '../../../store'
import { confirmApplication } from '../../../utils/schedule-status'
import { CitySelect } from '../../CitySelect'

dayjs.extend(utc)
dayjs.extend(timezone)

const { Text } = Typography

//get the papams that will be passed to filters through qs
const queryHandler = (params) => ({ // Get table params
    city_id: params.city_id,
    date_from: params.date_from,
    date_to: params.date_to,
    paginated: false,
})

const ShiftApproval = ({ selectedDate, tz, view }) => {
  dayjs.tz.setDefault(tz)
  const scheduleFilter = useFilterStore(state => state.scheduleFilter)
  const setScheduleFilter = useFilterStore(state => state.setScheduleFilter)
  const [permanent, setPermanent] = useState(false) // Set permanent state

  const filters = {
      city_id: Number(scheduleFilter.filter.city_id.replace('in|', '')),
      date_from: view === 1 ? selectedDate.week.startOf('week').format('YYYY-MM-DD') : selectedDate.day.format('YYYY-MM-DD'),
      date_to: view === 1 ? selectedDate.week.endOf('week').format('YYYY-MM-DD') : selectedDate.day.format('YYYY-MM-DD'),
  }

  const { data, isLoading, error, refetch } = useFetch(`/v1/shifts/applications?${qs.stringify(queryHandler(filters), { skipNulls: true, arrayFormat: 'comma' })}`)

  const handleApplication = async (shiftId, driverId, status, is_permanent = false) => {
    const payload = { 
      "action": status, 
      "driver_id": driverId,
      "is_permanent": is_permanent
    }
    await confirmApplication(payload, shiftId).then(() => {
      status === 'approved' ? message.success('Application Approved') : message.success('Application Rejected')
      refetch()
    } )
  }
  
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
          <Popconfirm
            title="Reject Application"
            description="Are you sure to reject this application?"
            icon={
              <QuestionCircleOutlined
                style={{
                  color: 'red',
                }}
              />
            }
            onConfirm={() => handleApplication(record.shift_id, record.user_id, 'decline')}
            okText="Yes, decline it"
            okButtonProps={{
              danger: true,
            }}
            cancelText="No"
          >
            <Button danger size="small">Decline</Button>
          </Popconfirm>
          <Popconfirm
            title="Approve Application"
            description={
              <Space direction="vertical" size={8} style={{ marginBottom: 16 }}>
                <Text>Are you sure to approve this application?</Text>
                <Space>
                  <Text strong>Permanent Driver?</Text>
                  <Switch size="small" onChange={checked => setPermanent(checked)} />
                </Space>
              </Space>
            }
            onConfirm={() => handleApplication(record.shift_id, record.user_id, 'approved', permanent)}
            okText="Yes, approve it"
            cancelText="No"
          >
            <Button type="primary" size="small">Approve</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  error && <>Something went wrong...</>

  return (
    <>
      { scheduleFilter.filter.city_id?.split('|')[1] ?
        <Table 
          columns={columns} 
          dataSource={data.data} 
          loading={isLoading}
          rowKey="id"
        />
        :
        <Result
            status="error"
            title="You have not selected a city"
            subTitle="Please select a city to view the schedule"
            extra={
                <CitySelect
                    value={scheduleFilter.filter.city_id ? Number(scheduleFilter.filter.city_id.replace('in|', '')) : null}
                    onChange={(value, label) => setScheduleFilter({ ...scheduleFilter, filter: { ...scheduleFilter.filter, city_id: `in|${value}`}, tz: label.timezone, city_label: label.label })}   
                    style={{ width: 200 }}
                />
            }
        />
      }
    </>
  )
}

export default ShiftApproval