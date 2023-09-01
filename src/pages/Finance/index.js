import {Table, Card, Button, Space } from "antd"; // import antd components

import { useState } from "react"; // import react hooks
import useNewFetch from "../../hooks/use-new-fetch"; // import custom hook

//import components
import CreateBounsModal from "../../components/BounsModal";


const Finance = () => {
const [open, setOpen] = useState(false);
    const columns = [
        {
            title: "Name",
            dataIndex: "name",
            key: "name",
        },
        {
            title: "Cities",
            dataIndex: "city_id",
            key: "city_id",
        },
        {
            title: "Type",
            dataIndex: "type",
            key: "type",
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
               return(start_time?.split("T")[0]) ;
            }
        },
        {
            title: "End Date",
            dataIndex: "end_time",
            key: "end_time",
            render: (end_time) => {
                return(end_time?.split("T")[0]) ;
            }
        },
    ];


const { data, loading, error } = useNewFetch("/v1/bonuses");
    console.log(data, loading, error);
    
 //handle closing modal
    const handleCancel = () => {
        setOpen(false);
    };


    return (
      <Card title={"Finance"} style={{ margin: 15 }}>
        <Space style={{ marginBottom: 15 }}>
          <Button type="primary" onClick={() => setOpen(true)}>
            Create Bonus
          </Button>
        </Space>
        <Table dataSource={data?.data} loading={loading} columns={columns} />
        <CreateBounsModal
          open={open}
          onCancel={handleCancel}
          onOk={handleCancel}
        />
      </Card>
    );
}

export default Finance;
    