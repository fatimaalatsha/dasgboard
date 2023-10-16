import { Table, Card, Button, Space, Alert, Modal } from "antd"; // import antd components
import { DeleteOutlined, EditTwoTone } from "@ant-design/icons"; // import antd icons
import { useEffect, useState, useRef } from "react"; // import react hooks
import useNewFetch from "../../hooks/use-new-fetch"; // import custom hook
import qs from "qs"; // Import qs library
import { useFilterStore } from "../../store"; // Import filter store
import { deleteBonus } from "../../utils/finance-status"; // Import API base url
import { getCities } from "../../utils/city-status"; // Import API base url
import CreateBounsModal from "../../components/BounsModal"; // Import API base url
import BounceDetails from "../BounceDetails"; // Import API base url
import BounceOverview  from "../BounceOverview"; // Import API base url
import { object } from "yup";

// user params
const getUserParams = (params) => ({
  // Get table params
  limit: params.pagination?.pageSize,
  page: params.pagination?.current,
  ...params,
});

const Finance = () => {
  const financeFilter = useFilterStore((state) => state.financeFilter);
  const setFinanceFilter = useFilterStore((state) => state.setFinanceFilter);
  const componentIsMounted = useRef(false) // Set the initial value to true
  const [cities, setCities] = useState([]);
  const [open, setOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [bounceId, setBounceId] = useState(null);
  const [warning, setWarning] = useState(false);

  // Fetch Cities list from API
  const loadCities = async () => {
    await getCities().then((response) => {
      setCities(response);
    });
  };
  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Cities",
      dataIndex: "cities",
      key: "city_id",
      render: (cities) => {
        return cities.map((city) => city.name).join(", ");
      },
      ellipsis: true,
      size: "large",
      sorter: true,
      filters: cities,
      filterSearch: true,
      filteredValue: null,
      ...(financeFilter.sort?.name && {
        defaultSortOrder:
          financeFilter.sort?.name === "asc" ? "ascend" : "descend",
      }),
      ...(financeFilter.filter?.city_id && {
        filteredValue: financeFilter.filter?.city_id.map((city_id, index) =>
          index === 0 ? city_id.replace("array|", "") : city_id.toString()
        ),
      }),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      filters: [
        {
          text: "Money",
          value: "money",
        },




        {
          text: "Rides",
          value: "rides",
        },
      ],
      filteredValue: null,
      ...(financeFilter.filter?.type && {
        filteredValue: financeFilter.filter?.type.map((type, index) =>
          index === 0 ? type.replace("in|", "") : type.toString()
        ),
      }),
      render: (type) => {
        // make the first letter capital
        return type.charAt(0).toUpperCase() + type.slice(1);
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      filters: [
        {
          text: "Active",
          value: "active",
        },
        {
          text: "Inactive",
          value: "inactive",
        },
        {
          text: "Completed",
          value: "completed",
        },
      ],
      filteredValue: null,
      ...(financeFilter.filter?.status && {
        filteredValue: financeFilter.filter?.status.map((status, index) =>
          index === 0 ? status.replace("in|", "") : status.toString()
        ),
      }),
      render: (status) => {
        return status === "active" ? (
          <span style={{ color: "blue" }}>{status}</span>
        ) : status === "inactive" ? (
          <span style={{ color: "orange" }}>{status}</span>
        ) : (
          <span style={{ color: "green" }}>{status}</span>
        );
      },
    },
    {
      title: "Start Date",
      dataIndex: "start_time",
      key: "start_time",
      align: "right",
      render: (start_time) => {
        //show date and time
        return start_time?.split("T")[0];
      },
      sorter: true,
      ...(financeFilter.sort?.field === "start_time" && {
        sortOrder: financeFilter.sorter.order,
      }),
    },
    {
      title: "End Date",
      dataIndex: "end_time",
      key: "end_time",
      align: "right",
      render: (end_time) => {
        return end_time?.split("T")[0];
      },
      sorter: true,
      ...(financeFilter.sort?.field === "end_time" && {
        sortOrder: financeFilter.sorter.order,
      }),
    },
    {
      title: "Goal",
      dataIndex: "goal",
      key: "goal",
      align: "center",
    },
    {
      title: "Payout",
      dataIndex: "payout",
      key: "payout",
      align: "center",
    },
    {
      title: "Action",
      key: "action",
      render: (text, record) => (
        <Space size="middle">
          <Button
            icon={<EditTwoTone />}
            type="text"
            onClick={() => {
              setBounceId(record.id);
              setShowDetails(true);
            }}
          ></Button>
          <Button
            icon={<DeleteOutlined />}
            danger
            type="text"
            onClick={
              // warning before delete
              () => {
                setBounceId(record.id);
                setWarning(true);
              }
            }
          ></Button>
          <Button
            type="primary"
            onClick={() => {
              setBounceId(record.id);
              setShowModal(true);
            }}
          >
            Details
          </Button>
        </Space>
      ),
    },
  ];

  const { data, error, loading, refetch } = useNewFetch(
    `/v1/bonuses?${qs.stringify(getUserParams(financeFilter), {
      skipNulls: true,
      arrayFormat: "comma",
    })}`
  );
  //handle closing modal  
  const handleCancel = () => {
    setOpen(false);
  };

  //handle table change
  const handleTableChange = (pagination, filter, sorter) => {

    Object.keys(filter).forEach((key) => {
      if (filter[key] && key !== "city_id") {
        filter[key].unshift("in|" + filter[key][0]);
        filter[key].splice(1, 1);
      }
    });
    
    Object.keys(filter).forEach((key) => {
      if (filter[key] && key === "city_id") {
        filter[key].unshift("array|" + filter[key][0]);
        filter[key].splice(1, 1);
      }
    });
    setFinanceFilter({
      // Set filter to store
      pagination: {
        ...financeFilter.pagination,
        ...pagination,
      },
      filter: {
        ...filter,
        ...(filter.city_id === null && { city_id: null }),
        ...(filter.status === null && { status: ["in|active", "inactive"] }),
      },
      ...(Object.keys(sorter).length !== 0 && {
        sort: {
          [`${sorter.columnKey === "cities" ? "name" : sorter.columnKey}`]:
            sorter.order === "ascend" ? "asc" : "desc",
        },
      }),
    });

  };

  useEffect(() => {
    let isMounted = true;
    setFinanceFilter({
      pagination: {
        ...financeFilter.pagination,
        total: data?.meta?.total_items,
        showTotal: (total, range) =>
          `${range[0]}-${range[1]} of ${total} Bonuses`,
      },
    });
     if(!componentIsMounted.current) { // Check if component is mounted
        loadCities()
      }

    return () => {
        componentIsMounted.current = true // Set the component mount state to false on component unmount
    }
  }, [data]);

  if (error) {
    return <div>{error}</div>;
  }
  if (loading) {
    return <div>Loading...</div>;
  }
  return (
    <Card title={"Finance"} style={{ margin: 15 }}>
      {warning && (
        <Modal
          title="Warning"
          open={warning}
          onCancel={() => setWarning(false)}
          onOk={() => {
            deleteBonus(bounceId);
            setWarning(false);
            refetch();
          }}
        >
          <Alert
            message="Warning"
            description="Are you sure you want to delete this bonus?"
            type="warning"
            showIcon
          />
        </Modal>
      )}
      <Space style={{ marginBottom: 15 }}>
        <Button type="primary" onClick={() => setOpen(true)}>
          Create Bonus
        </Button>
      </Space>
      <Table
        dataSource={data?.data}
        loading={loading}
        columns={columns}
        pagination={financeFilter.pagination}
        onChange={handleTableChange}
        rowKey="id"
      />
      <CreateBounsModal
        open={open}
        onCancel={handleCancel}
        onOk={handleCancel}
      />
      <BounceDetails
        bounceId={bounceId}
        open={showDetails}
        onCancel={() => {
          setBounceId(null);
          setShowDetails(false);
          refetch();
        }}
      />
      {showModal && (
        <BounceOverview
          bounceId={bounceId}
          onCancel={() => setShowModal(false)}
        />
      )}
    </Card>
  );
};

export default Finance;
