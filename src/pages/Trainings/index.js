import { Card, Table, Tag, Button, Tooltip, Space } from 'antd' // Import Ant components
import { ReloadOutlined } from '@ant-design/icons' // Import Ant Icons
import dayjs from "dayjs"// Import date handlers

import useFetch from '../../hooks/use-fetch'// Import useFetch custom hook

const tableColumns = [
    {
        title: 'Name',
        dataIndex: 'title',
    },
    {
        title: 'Cities',
        dataIndex: 'city_id',
        render: (city_id) => city_id ?? <Tag color="blue">All Cities</Tag>,
    },
    {
        title: 'Status',
        dataIndex: 'status',
        align: 'center',
        render: (status) => <Tag color={status === 'active' ? 'green' : 'red'}>{status.toUpperCase()}</Tag>,
    },
    {
        title: 'Updated At',
        dataIndex: 'updated_at',
        render: (text, record) => `${dayjs(text).format('YYYY-MM-DD - HH:mm:ss')}`,
        align: 'right',
    },
]

const Trainings = () => {
    const { data, isLoading, error, refetch } = useFetch(`/v1/trainings/cc`) // Fetch data from API

    const buttonConfig = {
        icon: <ReloadOutlined />,
        onClick: () => refetch(),
        type: 'primary',
        ghost: true,
        size: 'large',
        style: {
            marginBottom: '16px',
        },
    }

    if (error) {
      return <div>Something went wrong...</div>
    }

    return (
        <Card title={'Trainings'} style={{ margin: 15 }}>
            <Space direction="vertical" style={{ paddingBottom: 16 }}>
                <Tooltip title="Reload data">
                    <Button {...buttonConfig} />
                </Tooltip>
                <Button disabled type="primary">Add New Training</Button>
            </Space>
            <Table
                columns={tableColumns}
                dataSource={data?.items}
                loading={isLoading}
                rowKey={record => record.id}
            />
        </Card>
    )
}

export default Trainings