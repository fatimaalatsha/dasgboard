import useNewFetch from "../../hooks/use-new-fetch";
import { Typography, Table, Tag } from "antd";

const AutofleetDrivers = () => {

    const { data, error, isLoading } = useNewFetch(`/v1/active-drivers`);
    console.log(data)
    
    const columns = [   
        {
            title: "Driver ID",
            dataIndex: "id",
            key: "id",           
        },
        {
            title: "First Name",
            dataIndex: "first_name",
            key: "first_name",
        },
        {
            title: "Last Name",
            dataIndex: "last_name",
            key: "last_name",
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status) => (<Tag color={status === "online" ? "green" : (status === "stand-by" ? "gold" : "red")}>{status}</Tag>),
        },
        {
            title: "Adress",
            dataIndex: "address",
            key: "address",
        },
        ]
    isLoading && <p>Loading...</p>
    error && <p>{error}</p>
    return (
        <>
            <Typography.Title level={2}>Autofleet Drivers</Typography.Title>
            <Table columns={columns} dataSource={data.data} loading={isLoading} />
        </>
    )

}

export default AutofleetDrivers