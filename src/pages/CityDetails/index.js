import { 
    Card,
    Button,
    Typography,
    Space,
    Tag,
    Divider,
    Descriptions,
    Checkbox,
} from 'antd'
import { presetPalettes } from '@ant-design/colors'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { useParams } from 'react-router-dom'

import useFetch from '../../hooks/use-fetch'
import EditableText from '../../components/EditableText'

const { Title } = Typography // destructuring Typography component
const { Item } = Descriptions // destructuring Descriptions component

const CityDetails = () => {
    const { id } = useParams()
    const { data, isLoading, error, refetch } = useFetch(`/v1/cities/${id}`)

    const descriptionConfig = {
        layout: "vertical",
        colon: false,
         labelStyle:{ 
            fontSize: '14px',
            fontWeight: 400,
            color: '#8c8c8c',
            textTransform: 'capitalize',
        }
    }

    if (error) {
        return <>Error: {error.message}</>
    }
console.log(data)
    return (
        <Card
            title={
                <Space align="start">
                    <Button onClick={() => window.history.back()} type="text" icon={<ArrowLeftOutlined />} />
                    <Title>{data.name}</Title>
                    <Tag color="green" style={{ textTransform: 'capitalize'}}>{data.status}</Tag>
                </Space>
            }
            extra={
                <Button type="primary" danger>Deactivate</Button>
            }
            loading={isLoading}
        >
            <Descriptions {...descriptionConfig}>
                <Item label="driver licence classes">
                    <Space direction='vertical'>
                    {
                        data.licenses?.map((license, index) => (
                            <Checkbox key={index}>
                                <EditableText value={license.name} />
                            </Checkbox>
                        ))
                    }
                        <Button ghost type="primary">Add New Class</Button>
                    </Space>
                </Item>
                <Item label="driver minimum age">{data.min_age}</Item>
                <Item label="vehicle max manufacturing date">{data.vehicle_age}</Item>
            </Descriptions>
            <Divider orientation="left"><Title level={4}>Requirements</Title></Divider>
            <Divider orientation="left"><Title level={4}>Email Templates</Title></Divider>
            <Descriptions 
                title={<Title level={5}>Initial Documents</Title>} 
                {...descriptionConfig}
            >
                <Item label="driver licence">{data.minAge}</Item>
                <Item label="vehicle insurance">{data.vehicleAge}</Item>
                <Item label="vehicle ownership">{data.vehicleAge}</Item>
                <Item label="work eligibility">{data.vehicleAge}</Item>
                <Item label="driving record">{data.vehicleAge}</Item>
            </Descriptions>
            <Descriptions 
                title={<Title level={5}>Onboard Documents</Title>} 
                {...descriptionConfig}
            >
                <Item label="driver minimum age">{data.minAge}</Item>
                <Item label="vehicle max manufacturing date">{data.vehicleAge}</Item>
            </Descriptions>
            <Descriptions 
                title={<Title level={5}>Post-onboard Documents</Title>} 
                {...descriptionConfig}
            >
                <Item label="driver minimum age">{data.minAge}</Item>
                <Item label="vehicle max manufacturing date">{data.vehicleAge}</Item>
            </Descriptions>
        </Card>
    )
}

export default CityDetails