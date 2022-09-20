
import { 
    Descriptions,
    Tag,
} from 'antd' // Import antd components
import useFetch from "../../hooks/use-fetch" // Import useFetch custom hook

const DriverVehicle = ({ id }) => {
    const { data, isLoading, error } = useFetch(`/v1/drivers/cc/${id}/vehicles`)// Call useFetch custom hook
   // const { data, isLoading, error } = useFetch(`/v1/makes`)// Call useFetch custom hook

    if (isLoading) {
        return <>Loading...</>
    }

    if (error) {
        return <>Something went wrong</>
    }
    console.log(data)

    return (
        <Descriptions labelStyle={{ fontWeight:'bold' }} >
            <Descriptions.Item label="Plate Number">{data.plate_number}</Descriptions.Item>
            <Descriptions.Item label="Make">{data.make?.name}</Descriptions.Item>
            <Descriptions.Item label="Model">{data.model?.name}</Descriptions.Item>
            <Descriptions.Item label="Status">
                <Tag 
                    style={{ textTransform: 'capitalize'}} 
                    color={data.status === 'active' ? 'success' : 'error'}
                >
                    {data.status}
                </Tag>
            </Descriptions.Item>
        </Descriptions>
    )
}

export default DriverVehicle