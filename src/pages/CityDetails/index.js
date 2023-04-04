import { useState } from 'react'
import { 
    Card,
    Button,
    Typography,
    Space,
    Tag,
    Descriptions,
    Checkbox,
    Col,
    Row,
    Switch,
    List,
    Collapse,
    Modal,
} from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { useParams } from 'react-router-dom'

import useFetch from '../../hooks/use-fetch'
import useNewFetch from '../../hooks/use-new-fetch' // Import new endpoint hook
import { updateCityProfile } from '../../utils/city-status' // Import updateCityProfile function

import EditableText from '../../components/EditableText' // Import EditableText component

import WelcomeEmail from '../../components/email/WelcomeEmail' // Import WelcomeEmail component
import InitialDocuments from '../../components/email/InitialDocuments' // Import InitialDocuments component
import AppActivation from '../../components/email/AppActivation' // Import AppActivation component

const { Title, Text } = Typography // destructuring Typography component
const { Item } = Descriptions // destructuring Descriptions component
const { Panel } = Collapse // destructuring Collapse component
const { confirm } = Modal // Destructure config from Modal

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

const CityEmailTemplates = ({cityid}) => { // Email templates component
    const { data, isLoading, error, refetch } = useNewFetch(`/v1/cities/${cityid}/settings`) // Fetch city settings
    if (isLoading) {
        return <>Loading...</>
    }
    if (error) {
        return <>Something went wrong</>
    }

    return (
        <>
            <Collapse>
            <Panel header="Welcome Email" key="1">
                <WelcomeEmail data={data} id={cityid} refetch={refetch} />
            </Panel>
            <Panel header="Initial Document Submission" key="2">
                <InitialDocuments data={data} id={cityid} refetch={refetch} />
            </Panel>
            <Panel header="Activate Driver" key="3">
                <AppActivation data={data} id={cityid} refetch={refetch} />
            </Panel>
            </Collapse>
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
        <>
        <Space style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginBottom: '10px',
        }}>
            <Button type="primary" ghost>Add New Requirement</Button>
        </Space>
        <Row gutter={[16, 14]}>
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
        </>
    )
}

const CityProfile = ({ data, cityid }) => { // Editable info profile component
    return (
        <Descriptions {...descriptionConfig}>
            <Item label="driver minimum age">
                <EditableText name="min_age" value={data?.min_age.toString()} updateCallback={value => updateCityProfile(cityid, value)}/>
            </Item>
            <Item label="maximum vehicle age (years)">
                <EditableText name="vehicle_age" value={data?.vehicle_age.toString()} updateCallback={value => updateCityProfile(cityid, value)}/>
            </Item>
            <Item label="total tax rate">
                <Space align="baseline">
                    <EditableText value={data?.tax_rate} />
                    <Text>{ data?.province_id === 1 ? 'HST' : 'GST + PST' }</Text>
                </Space>
            </Item>
            <Item label="recruitment email address">
                <EditableText name="email" value={data?.email} updateCallback={value => updateCityProfile(cityid, value)}/>
            </Item>
        </Descriptions>
    )
}

const CityDetails = () => {
    const { id } = useParams()
    const { data, isLoading, error, refetch } = useNewFetch(`/v1/cities/${id}`)
    const [loading, setLoading] = useState(false)

    if (error) {
        return <>Error: {error.message}</>
    }

    const showConfirm = (status) => {
      setLoading(true)
      confirm({
        title: 
            <Title level={4}>
              {`Are you sure you want to change the status to `}
              <Text style={{ textTransform: 'capitalize'}} mark strong>{status}?</Text>
            </Title>,
        content: 'This action cannot be undone.',
        onOk: async () => {
          await updateCityProfile( id, {status: status})
          .then((res) => {
            if (res) {
              setLoading(false)
              refetch()
            }
          })
        },
        onCancel() {
          setLoading(false)
          console.log('Cancel');
        },
      });
    }
    
    return (
        <Card
            title={
                <Space align="start">
                    <Button onClick={() => window.history.back()} type="text" icon={<ArrowLeftOutlined />} />
                    <Title>{data.name}</Title>
                    <Tag color={data.status === 'active' ? "green" : 'red' } style={{ textTransform: 'capitalize'}}>{data.status}</Tag>
                </Space>
            }
            extra={
                data.status === 'active' ?
                (<Button loading={loading} type="primary" danger onClick={() => showConfirm('inactive')}>Deactivate</Button>) :
                (<Button loading={loading} type="primary" onClick={() => showConfirm('active')}>Activate</Button>)
            }
            loading={isLoading}
        >
            <CityProfile cityid={id} data={data} />
            <Collapse>
                <Panel header="Requirements" key="1">
                    <CityRequirements />
                </Panel>
                <Panel header="Email Templates" key="2">
                    <CityEmailTemplates cityid={id}/>
                </Panel>
            </Collapse>
        </Card>
    )
}

export default CityDetails