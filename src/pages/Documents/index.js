import { useEffect, useState } from 'react'
import { Card, Table, Tag } from 'antd'; // Import Ant components
import qs from 'qs' // Import qs library
import dayjs from "dayjs"// Import date handlers
import utc from 'dayjs/plugin/advancedFormat' // Import dayjs utc plugin
import { useNavigate } from 'react-router-dom'; // Import hook from react-router

import useFetch from '../../hooks/use-fetch'// Import useFetch custom hook
import API from '../../api/BaseUrl' // Import API

const getUserParams = (params) => ({ // Get table params
    limit: params.pagination?.pageSize,
    page: params.pagination?.current,
    ...params,
})
dayjs.extend(utc)
const Documents = () => {
    const navigate = useNavigate()
    const controller = new AbortController()// Create a new abort controller
    const [tableParams, setTableParams] = useState({ // Set table params
        pagination: {
          current: 1,
          pageSize: 20,
        },
    })
    const [cities, setCities] = useState([])
    const { data, isLoading, error, refetch } = useFetch(`v1/documents/cc?${qs.stringify(getUserParams(tableParams), { skipNulls: true, arrayFormat: 'comma' })}`) // Fetch data from API

    const handleTableChange = (pagination, filter, sorter) => { // Handle table change
        Object.keys(filter).forEach(key => {
            if (filter[key]) {
              filter[key].unshift('in|'+ filter[key][0])
              filter[key].splice(1, 1)
            }
          })
        setTableParams({
            pagination,
            filter,
            ...sorter,
        })
    }

    const getCities = async () => {
        try { 
          const response = await API.get('/v1/cities')
          const data = await response.data
          if (data) {
            const cities = data.items.map((city) => {
              city.value = city.city_id
              city.text = city.name
              delete city.name
              return city;
            })
            setCities(cities)
          }
        }
        catch (error) {
          console.log(error)
        }  
      }

    useEffect(() => {
        setTableParams({// Set table params
            ...tableParams,
            pagination: {
                ...tableParams.pagination,
                total: data?.total_items,
            }
        }) 
        getCities()
        return () => controller.abort()// Abort fetch on unmount
    }, [data]) // Update table params

    console.log(data)
    const tableColumns = [
        {
            title: 'Driver',
            dataIndex: 'first_name',
            render: (text, record) => `${record.first_name} ${record.last_name}`,
        },
        {
            title: 'Document',
            dataIndex: 'title',
        },
        {
            title: 'City',
            dataIndex: 'city',
            filters: cities, 
            key: 'city_id',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            align: 'center',
            render: (status) => <Tag color={status === 'approved' ? 'green' : status === 'rejected' ? 'volcano' : 'orange'}>{status.toUpperCase()}</Tag>,
            filters: [
                { text: 'Review', value: 'review' },
                { text: 'Approved', value: 'approved' },
                { text: 'Rejected', value: 'rejected' },

            ],
        },
        {
            title: 'Updated At',
            dataIndex: 'updated_at',
            render: (text, record) => `${dayjs(text).format('YYYY-MM-DD - HH:mm:ss')}`,
            align: 'right',
            sorter: true,
        },
    ]
//console.log(data)
    return (
        <Card title={'Documents'} style={{ margin: 15 }}>
            <Table
                columns={tableColumns}
                dataSource={data?.items}
                loading={isLoading}
                rowKey={record => record.id + record.type}
                pagination={tableParams.pagination}onRow={(driverRecord) => ({
                    onClick: () => navigate(`/driver/${driverRecord.user_id}`)
                })}
                onChange={handleTableChange}
            />
        </Card>
    )
}
export default Documents