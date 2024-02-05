import { useEffect, useState } from 'react'
import { Card, Table, Tag, Button, Tooltip, Typography, Space } from "antd"; // Import Ant components
import { ReloadOutlined } from '@ant-design/icons' // Import Ant Icons
import qs from 'qs' // Import qs library
import dayjs from "dayjs"// Import date handlers
import utc from 'dayjs/plugin/advancedFormat' // Import dayjs utc plugin
import { useLocation } from 'react-router-dom' // Import hook from react-router

import useFetch from '../../hooks/use-new-fetch'// Import useFetch custom hook

import { useFilterStore } from '../../store' // Import filter store
import { getCities } from '../../utils/city-status'

const getUserParams = (params) => ({ // Get table params
    limit: params.pagination?.pageSize,
    page: params.pagination?.current,
    ...params,
})

dayjs.extend(utc)

const Documents = () => {
    const documentFilter = useFilterStore((state) => state.documentFilter) // Get filter from store
    const setDocumentFilter = useFilterStore((state) => state.setDocumentFilter) // Set filter to store

    const location = useLocation()
    const currentUrl = location.pathname

    const controller = new AbortController()// Create a new abort controller
    const [cities, setCities] = useState([])
    const { data, isLoading, error, refetch } = useFetch(`v1/documents?${qs.stringify(getUserParams(documentFilter), { skipNulls: true, arrayFormat: 'comma' })}`) // Fetch data from API
  

  const handleTableChange = (pagination, filter, sorter) => {

    Object.keys(filter).forEach((key) => {
      if (filter[key] ) {
        filter[key].unshift("in|" + filter[key][0]);
        filter[key].splice(1, 1);
        // if bot and no are selected, remove the filter
        if ((filter[key][0] === "in|true" || filter[key][0] === "in|false") && filter[key].length > 1) {
          filter[key] = null;}
      }   
     });      

     setDocumentFilter({
       pagination,
       filter: {
         ...documentFilter.filter,
         ...filter,
         ...(documentFilter.filter?.["c.id"] &&
           filter["c.id"] &&
           filter["c.id"][0] === "in|undefined" &&
           documentFilter.filter["c.id"] !== "in|" && {
             "c.id": documentFilter.filter["c.id"],
         }),
       },
       ...(Object.keys(sorter).length !== 0 && {
         sort: {
           [`${sorter.columnKey === "c.id" ? "city" : sorter.columnKey}`]:
             sorter.order === "ascend" ? "asc" : "desc",
         },
       }),
     });
   };





    const fetchCities = async () => {
      await getCities().then((response) => {
        setCities(response)
      })
    }

    useEffect(() => {
        setDocumentFilter({ // Set filter to store
            pagination: {
                ...documentFilter.pagination,
                total: data.meta?.total_items,
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} Documents`,

            }
        }) 
        fetchCities()
        return () => controller.abort()// Abort fetch on unmount
    }, [data]) // Update table params

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

    const LinkRow = ({
      children,
      record,
      ...props
    }) => {
      
      return (
           <td {...props}>
            <Typography.Link href={`${currentUrl}/${record?.user_id}`} style={{ padding: 8, display: 'block', color: 'inherit', wordBreak: 'inherit' }}>
              {children}
            </Typography.Link>
          </td>
      )
    }

    const tableColumns = [
      {
        title: "Driver",
        dataIndex: "first_name",
        render: (text, record) => `${record.first_name} ${record.last_name}`,
      },
      {
        title: "Document",
        dataIndex: "title",
      },
      {
        title: "City",
        dataIndex: "city",
        filters: cities,
        key: "c.id",
        sorter: true,
        filterSearch: true,
        ...(documentFilter.filter?.["c.id"] && {
          defaultFilteredValue: documentFilter.filter?.["c.id"].map(
            (city, index) =>
              index === 0 ? city.replace("in|", "") : city.toString()
          ),
        }),
        ...(documentFilter.sort?.city && {
          defaultSortOrder:
            documentFilter.sort?.city === "asc" ? "ascend" : "descend",
        }),
      },
      {
        title: "Status",
        dataIndex: "status",
        align: "center",
        render: (status) => (
          <Tag
            color={
              status === "approved"
                ? "green"
                : status === "rejected" || status === "expired"
                ? "red"
                : status === "review"
                ? "purple"
                : "gold"
            }
          >
            {status.toUpperCase()}
          </Tag>
        ),
        filters: [
          { text: "Review", value: "review" },
          { text: "Approved", value: "approved" },
          { text: "Rejected", value: "rejected" },
          { text: "Expired", value: "expired" },
        ],
        ...(documentFilter.filter?.status && {
          defaultFilteredValue: documentFilter.filter?.status.map((status) =>
            status.replace("in|", "")
          ),
        }),
      },
      {
        title: "Expiring",
        dataIndex: "is_expiring",
        align: "center",
        filters: [
          { text: "Yes", value: true },
          { text: "No", value: false },
        ],
        ...(documentFilter.filter?.is_expiring && {
          defaultFilteredValue: documentFilter.filter?.is_expiring.map(
            (is_expiring) => is_expiring.replace("in|", "")
          ),
        }),
        render: (is_expiring) => (
          <Tag color={is_expiring ? "red" : "green"}>
            {is_expiring ? "Yes" : "No"}
          </Tag>
        ),
        
      },
      {
        title: "Driver Status",
        dataIndex: "driver_status",
        key: "u.status",
        align: "center",
        render: (status) => (
          <Tag
            color={
              status === "active"
                ? "green"
                : status === "inactive"
                ? "red"
                : status === "suspended"
                ? "volcano"
                : status === "pending"
                ? "gold"
                : "blue"
            }
          >
            {status.toUpperCase()}
          </Tag>
        ),
        filters: [
          { text: "Inactive", value: "inactive" },
          { text: "Active", value: "active" },
          { text: "Suspended", value: "suspended" },
          { text: "Pending", value: "pending" },
          {text : "Onboard", value: "onboard"},
        ],
        ...(documentFilter.filter?.["u.status"] && {
          defaultFilteredValue: documentFilter.filter?.["u.status"].map(
            (status) => status.replace("in|", "")
          ),
        }),
      },
      {
        title: "Updated At",
        dataIndex: "updated_at",
        render: (text, record) =>
          `${dayjs(text).format("YYYY-MM-DD - HH:mm:ss")}`,
        align: "right",
        sorter: true,
        key: "updated_at",
        ...(documentFilter.sort?.updated_at && {
          defaultSortOrder:
            documentFilter.sort?.updated_at === "asc" ? "ascend" : "descend",
        }),
      },
    ];

    const columns = tableColumns.map((col) => {
      return {
        ...col,
        onCell: (record) => ({
          record
        }),
      }
    })

    if (error) {
      return <div>Something went wrong...</div>
    }

    return (
        <Card title={'Documents'} style={{ margin: 15 }}>
            <Tooltip title="Reload data">
                <Button {...buttonConfig} />
                    </Tooltip>
            <Table
                columns={columns}
                dataSource={data?.data}
                loading={isLoading}
                rowKey={record => record.id + record.type}
                sortDirections={['ascend', 'descend', 'ascend']}
                pagination={documentFilter.pagination}
                rowClassName={() => 'clickable-row'}
                components={{
                  body: {
                    cell: LinkRow,
                  },
                }}
                onChange={handleTableChange}
            />
        </Card>
    )
}
export default Documents