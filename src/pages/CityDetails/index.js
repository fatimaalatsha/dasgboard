import { 
    Card,
    Button,
    Typography,
    Space,
    Tag,
    Divider,
    Descriptions,
    Checkbox,
    Col,
    Row,
    Switch,
    List,
    Collapse,
} from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { useParams } from 'react-router-dom'

import useFetch from '../../hooks/use-fetch'
import EditableText from '../../components/EditableText'

const { Title, Text } = Typography // destructuring Typography component
const { Item } = Descriptions // destructuring Descriptions component
const { Panel } = Collapse // destructuring Collapse component

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

const CityEmailTemplates = ({data}) => { // Email templates component
    return (
        <>
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
            </>
    )
}

const CityRequirements = () => {
    const reqArray = [
        {
            title: 'driver licence',
            name: 'driver_license',
            onboard: true,
            skip: false,
            expirationDate: true,
            expirationDateRequired: true,
            type: 'user',

        },
        {
            title: 'proof of work eligibility',
            name: 'work_permit',
            onboard: true,
            skip: false,
            expirationDate: true,
            expirationDateRequired: false,
            type: 'user',

        },
        {
            title: 'driver history/abstract',
            name: 'abstract',
            onboard: true,
            skip: true,
            expirationDate: true,
            expirationDateRequired: true,
            type: 'user',

        },
        {
            title: 'city licensing',
            name: 'licensing',
            onboard: true,
            skip: false,
            expirationDate: true,
            expirationDateRequired: true,
            type: 'user',

        },
        {
            title: 'background check',
            name: 'background',
            onboard: true,
            skip: false,
            expirationDate: true,
            expirationDateRequired: true,
            type: 'user',

        },
        {
            title: 'vehicle registration',
            name: 'ownership',
            onboard: true,
            skip: false,
            expirationDate: false,
            expirationDateRequired: false,
            type: 'vehicle',

        },
        {
            title: 'insurance information',
            name: 'insurance',
            onboard: true,
            skip: false,
            expirationDate: true,
            expirationDateRequired: true,
            type: 'vehicle',

        },
        {
            title: 'safety inspection',
            name: 'safety',
            onboard: true,
            skip: true,
            expirationDate: true,
            expirationDateRequired: true,
            type: 'vehicle',

        },
    ]
    return (
        <Row gutter={[16, 24]}>
            {
                reqArray.map((req, index) => (
                    <Col key={index} span={8}>
                        <Card 
                            headStyle={{ textTransform: 'capitalize' }}
                            title={
                                <Space size="large" align='baseline'>
                                    <Title level={5} >
                                        <EditableText name={req.name} value={req.title} />
                                    </Title>
                                    {
                                        req.type === 'user' ?
                                            <Tag color="blue">user</Tag> :
                                            <Tag color="purple">vehicle</Tag>
                                    }
                                </Space>
                            } 
                            extra={<Switch size="small" defaultChecked />}
                        >
                            <List>
                                <List.Item>
                                    <Text>Initial document?</Text>
                                    <Checkbox defaultChecked={req.onboard} />
                                </List.Item>
                                <List.Item>
                                    <Text>Skippable?</Text>
                                    <Checkbox defaultChecked={req.skip} />
                                </List.Item>
                                <List.Item>
                                    <Text>Expiration date?</Text>
                                    <Checkbox defaultChecked={req.expirationDate} />
                                </List.Item>
                                <List.Item>
                                    <Text>Expiration required?</Text>
                                    <Checkbox defaultChecked={req.expirationDateRequired} />
                                </List.Item>
                            </List>
                        </Card>
                    </Col>
                ))
            }
        </Row>
    )
}

const CityProfile = ({data}) => { // Editable info profile component
    return (
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
            <Item label="driver minimum age">
                <EditableText value={data.min_age} />
            </Item>
            <Item label="vehicle max manufacturing date">
                <EditableText value={data.vehicle_age} />
            </Item>
            <Item label="total tax rate">
                <Space align="baseline">
                    <Title level={5}>PST + GST</Title>
                    <EditableText value="13" />
                </Space>
            </Item>
            <Item label="base fare">
                <EditableText value="13" />
            </Item>
            <Item label="driver pay rate">
                <EditableText value="13" />
            </Item>
        </Descriptions>
    )
}

const CityDetails = () => {
    const { id } = useParams()
    const { data, isLoading, error, refetch } = useFetch(`/v1/cities/${id}`)

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
            <CityProfile data={data} />
            <Collapse>
                <Panel header="Requirements" key="1">
                    <CityRequirements />
                </Panel>
                <Panel header="Email Templates" key="2">
                    <CityEmailTemplates data={data}/>
                </Panel>
            </Collapse>
        </Card>
    )
}

export default CityDetails