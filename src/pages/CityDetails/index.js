import { useState } from 'react'
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
    Input,
} from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { useParams } from 'react-router-dom'
import { Form, Formik } from 'formik'
import { object, string, number } from 'yup' // Import yup validation schema

import useFetch from '../../hooks/use-fetch'
import { updateCityProfile } from '../../utils/city-status' // Import updateCityProfile function

import EditableText from '../../components/EditableText' // Import EditableText component
import SubmitWrapper from '../../components/forms/SubmitWrapper' // Import SubmitWrapper component
import InputWrapper from '../../components/forms/InputWrapper' // Import InputWrapper component

import WelcomeEmail from '../../components/email/WelcomeEmail' // Import WelcomeEmail component
import InitialDocuments from '../../components/email/InitialDocuments' // Import InitialDocuments component

const { Title, Text } = Typography // destructuring Typography component
const { Item } = Descriptions // destructuring Descriptions component
const { Panel } = Collapse // destructuring Collapse component
const { Search, TextArea } = Input // destructuring Input component

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

const safetyDealSchema = object().shape({
    shop_name: string().required('Required'),
    shop_address: string().required('Required'),
    shop_number: string().required('Required'),
    deal_details: number().required('Required'),
})

const backgroundLinkSchema = object().shape({
    link: string().required('Required'),
    link_text: string().required('Required')
})

//console.log(emailTemplates)
const CityEmailTemplates = ({cityid}) => { // Email templates component
    const { data, isLoading, error, refetch } = useFetch(`/v1/cities/cc/${cityid}/settings`) // Fetch city settings
    console.log("City Settings: ",data)

    const [showForm, setShowForm] = useState({
        agreement: false,
        background_link: false,
    })

    const initialValues = {
        agreement: {
            shop_name: '',
            shop_address: '',
            shop_number: '',
            deal_details: '',
        },
        background: {
            link: '',
            link_text: '',
        }
}

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
                <Space direction="vertical" style={{ width: '100%', padding: '16px 0'}}>
                    <Divider orientation="left">App Activation</Divider>
                    <Search
                        addonBefore="Phone Number"
                        placeholder="Activation Number"
                        defaultValue="+12362371117"
                        enterButton="Update"
                        size="middle"
                    />
                </Space>
            </Panel>
            </Collapse>
            {/* <Descriptions 
                bordered 
                column={1}
            > */}
                {/* {
                    Object.keys(emailTemplates['stage_1']).map((key, index) => {
                        console.log('titles: ', emailTemplates['stage_1'][key].title)
                        return (
                            <Item key={index} label={emailTemplates['stage_1'][key].title}>
                                {
                                    Object.keys(emailTemplates['stage_1'][key]).map((children, index) => {
                                        console.log(children)
                                        return (
                                            <>
                                             <EditableText key={index} value={emailTemplates['stage_1'][key][children]} />
                                             </>
                                        )
                                    })
                                }
                            </Item>
                        )
                    })
                } */}
            {/* </Descriptions> */}
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

const CityProfile = ({data, cityid}) => { // Editable info profile component
    return (
        <Descriptions {...descriptionConfig}>
            <Item label="driver minimum age">
                <EditableText name="min_age" value={data?.minAge.toString()} updateCallback={value => updateCityProfile(cityid, value)}/>
            </Item>
            <Item label="maximum vehicle age (years)">
                <EditableText name="vehicle_age" value={data?.vehicleAge.toString()} updateCallback={value => updateCityProfile(cityid, value)}/>
            </Item>
            <Item label="total tax rate">
                <Space align="baseline">
                    <Text level={5}>PST + GST</Text>
                    {/* <EditableText value="13" /> */}
                    <Text>13</Text>
                </Space>
            </Item>
            {/* <Item label="base fare">
                <EditableText value="13" /> 
                <Text>13</Text>
            </Item> */}
            {/* <Item label="driver pay rate">
                <EditableText value="13" />
                <Text>13</Text>
            </Item> */}
            <Item label="recruitment email address">
                {/* <EditableText name="email" value="city@uridetech.com" updateCallback={value => updateCityProfile(cityid, value)}/> */}
                <Text>city@uridetech.com</Text>
            </Item>
        </Descriptions>
    )
}

const CityDetails = () => {
    const { id } = useParams()
    const { data, isLoading, error, refetch } = useFetch(`/v1/cities/cc/${id}`)
    
    if (error) {
        return <>Error: {error.message}</>
    }
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