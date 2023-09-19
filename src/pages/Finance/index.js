import { Table, Card, Button, Space } from "antd"; // import antd components

import { useEffect, useState } from "react"; // import react hooks
import useNewFetch from "../../hooks/use-new-fetch"; // import custom hook
import qs from "qs"; // Import qs library
import { useFilterStore } from "../../store"; // Import filter store
import { deleteBonus } from "../../utils/finance-status"; // Import API base url
//import components
import CreateBounsModal from "../../components/BounsModal";
import BounceDetails from "../BounceDetails";

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

  const [open, setOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [bounceId, setBounceId] = useState(null);
    const columns = [
      {
        title: "Name",
        dataIndex: "name",
        key: "name",
      },
      {
        title: "Cities",
        dataIndex: "cities",
        key: "cities",
        render: (cities) => {
          return cities.map((city) => city.name).join(", ");
        }
        
      },
      {
        title: "Type",
        dataIndex: "type",
        key: "type",
        render: (type) => {// make the first letter capital
          return type.charAt(0).toUpperCase() + type.slice(1);
        },
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        render: (status) => {
          return status === "active" ? (
            <span style={{ color: "green" }}>{status}</span>
          ) : (
            <span style={{ color: "red" }}>{status}</span>
          );
        },
      },
      {
        title: "Goal",
        dataIndex: "goal",
        key: "goal",         
      },
      {
        title: "Start Date",
        dataIndex: "start_time",
        key: "start_time",
        render: (start_time) => {
          //show date and time
          return start_time?.split("T")[0];
        },
      },
      {
        title: "End Date",
        dataIndex: "end_time",
        key: "end_time",
        render: (end_time) => {
          return end_time?.split("T")[0];
        },
      },
      {
        title: "Payout",
        dataIndex: "payout",
        key: "payout",
      },
      {
        title: "Action",
        key: "action",
        render: (text, record) => (
          <Space size="middle">
            <Button>Edit</Button>
            <Button
              onClick={() => {
                deleteBonus(record.id);
                refetch();
              }
              }
            >Delete</Button>
            <Button onClick={() =>{
              setBounceId(record.id);
              console.log(record.id);
              setShowDetails(true);
            }
            }>Details</Button>
          </Space>
        ),
      }
    ];

      // const { data, loading, error } = useNewFetch("/v1/bonuses");
      const { data, error, loading, refetch } = useNewFetch(
        `/v1/bonuses?${qs.stringify(getUserParams(financeFilter), {
          skipNulls: true,
          arrayFormat: "comma",
        })}`
  );
 console.log(data);
  //handle closing modal
  const handleCancel = () => {
    setOpen(false);
    };
    
    //handle table change
   const handleTableChange = (pagination, filter, sorter) => {
     // Handle table change
     Object.keys(filter).forEach((key) => {
       if (filter[key] && key !== "city_id") {
         filter[key].unshift("in|" + filter[key][0]);
         filter[key].splice(1, 1);
       }
     });

     setFinanceFilter({
       // Set filter to store
       pagination: {
         ...financeFilter.pagination,
         ...pagination,
       },
    //    filter: {
    //      ...filter,
    //      city_id: null,
    //    },
    //    sort: {
    //      ...financeFilter.sort,
    //      ...sorter,
    //    },
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
        if (isMounted) {
            refetch();
        }
        return () => {
            isMounted = false;
        }
    }, [
        financeFilter.pagination.current,        
    ]);

   


  return (
    <Card title={"Finance"} style={{ margin: 15 }}>
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
      />
      <CreateBounsModal
        open={open}
        onCancel={handleCancel}
        onOk={handleCancel}
      />
      {showDetails && <BounceDetails bounceId={bounceId} />}
    </Card>
  );
};

export default Finance;
