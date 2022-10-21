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
import EditableText from '../../components/EditableText'
import emailTemplates from '../../dummy/city-info'

import SubmitWrapper from '../../components/forms/SubmitWrapper' // Import SubmitWrapper component
import InputWrapper from '../../components/forms/InputWrapper' // Import InputWrapper component

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
const CityEmailTemplates = ({data}) => { // Email templates component
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

    return (
        <>
            <Collapse>
            <Panel header="Welcome Email" key="1">
                <Space direction="vertical" style={{ width: '100%', padding: '16px 0'}}>
                    <Divider orientation="left">Driver Licence</Divider>
                    <Search
                        addonBefore="Name"
                        placeholder="Requirement Name"
                        defaultValue="Driver License"
                        enterButton="Update"
                        size="middle"
                    />
                    <Search
                        addonBefore="Class"
                        placeholder="Requirement Name"
                        defaultValue="Full G Class Licence"
                        enterButton="Update"
                        size="middle"
                    />
                </Space>
                <Space direction="vertical" style={{ width: '100%', padding: '16px 0'}}>
                    <Divider orientation="left">Driver Abstract</Divider>
                    <Search
                        addonBefore="Name"
                        placeholder="Requirement Name"
                        defaultValue="Driver's Abstract"
                        enterButton="Update"
                        size="middle"
                    />
                    <Search
                        addonBefore="Document Name"
                        placeholder="Document Name"
                        defaultValue="Ontario Driver's Abstract"
                        enterButton="Update"
                        size="middle"
                    />
                    <Search
                        addonBefore="Place"
                        placeholder="Place"
                        defaultValue="Service Ontario"
                        enterButton="Update"
                        size="middle"
                    />
                    <Search
                        addonBefore="URL"
                        placeholder="URL to get the document"
                        defaultValue="https://www.services.gov.on.ca/wps85/portal/s2i/!ut/p/z1/dYvBCoJAFAC_pR_Yt7uF2tGCCgQtjMq9yNO15aG8FQyFvj7pZtBxhhkw8ADDOJLDF3nGbubCBGV0lIGONyrNknArLzeVRSeVrGWqoZiD8G9w0JCDAZNr2mHdXv0ZXQNFjcKzcH4UgybRz050yJbYCTsOi-FObP30u0xfu5jyhst9DH2L1fvpVh_SE-oq/"
                        enterButton="Update"
                        size="middle"
                    />
                    <Search
                        addonBefore="URL Name"
                        placeholder="Name displayed on the URL"
                        defaultValue="Ontario Driver's Abstract"
                        enterButton="Update"
                        size="middle"
                    />
                </Space>
                <Space direction="vertical" style={{ width: '100%', padding: '16px 0'}}>
                    <Divider orientation="left">Vehicle Ownership</Divider>
                    <Search
                        addonBefore="Name"
                        placeholder="Requirement Name"
                        defaultValue="Vehicle Ownership"
                        enterButton="Update"
                        size="middle"
                    />
                    <Descriptions bordered size="small" labelStyle={{ width: '100px'}} column={1}>
                        <Item label="Content" contentStyle={{ margin: 16}}>
                            <TextArea
                                style={{ width: '100%', marginBottom: 16}}
                                placeholder="Requirement Content"
                                defaultValue="The vehicle ownership must be under your name."
                                size="large"
                                autoSize={{ minRows: 2, maxRows: 3 }}
                            />
                            <Button type="primary">Update</Button>
                        </Item>
                        <Item label="Notes" contentStyle={{ margin: 16}}>
                            <TextArea
                                style={{ width: '100%', marginBottom: 16}}
                                placeholder="Requirement Content"
                                defaultValue="If the vehicle is under your spouse's name please include an authorization letter stating that they are aware the vehicle will be used for rideshare."
                                size="large"
                                autoSize={{ minRows: 2, maxRows: 3 }}
                            />
                            <Button type="primary">Update</Button>
                        </Item>
                    </Descriptions>
                </Space>
                <Space direction="vertical" style={{ width: '100%', padding: '16px 0'}}>
                    <Divider orientation="left">Vehicle Insurance</Divider>
                    <Search
                        addonBefore="Name"
                        placeholder="Requirement Name"
                        defaultValue="Vehicle Insurance"
                        enterButton="Update"
                        size="middle"
                    />
                    <Descriptions bordered size="small" labelStyle={{ width: '100px'}} column={1}>
                        <Item label="Content" contentStyle={{ margin: 16}}>
                            <TextArea
                                style={{ width: '100%', marginBottom: 16}}
                                placeholder="Requirement Content"
                                defaultValue="Please provide a copy of the current automobile liability insurance. With limits of not less than 2M."
                                size="large"
                                autoSize={{ minRows: 2, maxRows: 3 }}
                            />
                            <Button type="primary">Update</Button>
                        </Item>
                    </Descriptions>
                </Space>
                <Space direction="vertical" style={{ width: '100%', padding: '16px 0'}}>
                    <Divider orientation="left">Work Eligibility</Divider>
                    <Search
                        addonBefore="Name"
                        placeholder="Requirement Name"
                        defaultValue="Proof Of Work Eligibility"
                        enterButton="Update"
                        size="middle"
                    />
                    <Descriptions bordered size="small" labelStyle={{ width: '100px'}} column={1}>
                        <Item label="Content" contentStyle={{ margin: 16}}>
                            <TextArea
                                style={{ width: '100%', marginBottom: 16}}
                                placeholder="Requirement Content"
                                defaultValue=""
                                size="large"
                                autoSize={{ minRows: 2, maxRows: 3 }}
                            />
                            <Button type="primary">Update</Button>
                        </Item>
                    </Descriptions>
                </Space>
            </Panel>
            <Panel header="Initial Document Submission" key="2">
                <Space direction="vertical" style={{ width: '100%', padding: '16px 0'}}>
                    <Divider orientation="left">Vehicly Safety</Divider>
                    <Search
                        addonBefore="Name"
                        placeholder="Requirement Name"
                        defaultValue="Driver License"
                        enterButton="Update"
                        size="middle"
                    />
                    <Space direction="vertical" style={{ width: '100%', padding: '16px 0'}}>
                    <Checkbox checked={showForm.agreement} onChange={() => setShowForm({...showForm, agreement: !showForm.agreement})}>Agreement?</Checkbox>
                    {
                        showForm.agreement && (
                            <Formik
                                initialValues={initialValues.agreement}
                                validationSchema={safetyDealSchema}
                                onSubmit={ async (values, { setSubmitting }) => {
                                    console.log(values)
                                    setSubmitting(false)
                                }
                            }>
                                <Form>
                                    <Space direction="vertical" style={{ width: '100%'}}>
                                        <InputWrapper name="shop_name" placeholder="Shop Name" maxLength={50} />
                                        <InputWrapper name="shop_address" placeholder="Shop Address" maxLength={50} />
                                        <InputWrapper name="shop_number" placeholder="Shop Number" maxLength={15} />
                                        <InputWrapper name="deal_details" placeholder="Agreement Details" maxLength={100} />                           
                                        <SubmitWrapper key="submit" type="primary">
                                            Add Agreement
                                        </SubmitWrapper>
                                    </Space>
                                </Form>
                            </Formik>)
                    }
                    <Divider orientation="left">Background Check</Divider>
                    <Search
                        addonBefore="Name"
                        placeholder="Requirement Name"
                        defaultValue="Background Check"
                        enterButton="Update"
                        size="middle"
                    />
                    <Descriptions bordered size="small" labelStyle={{ width: '100px'}} column={1}>
                        <Item label="Content" contentStyle={{ margin: 16}}>
                            <TextArea
                                style={{ width: '100%', marginBottom: 16}}
                                placeholder="Requirement Content"
                                defaultValue="Complete your background check at:"
                                size="large"
                                autoSize={{ minRows: 2, maxRows: 3 }}
                            />
                            <Button type="primary">Update</Button>
                        </Item>
                    </Descriptions>
                    <Space direction="vertical" style={{ width: '100%', padding: '16px 0'}}>
                        <Checkbox checked={showForm.background_link} onChange={() => setShowForm({...showForm, background_link: !showForm.background_link})}>Link?</Checkbox>
                        {
                            showForm.background_link && (
                                <Formik
                                    initialValues={initialValues.background}
                                    validationSchema={backgroundLinkSchema}
                                    onSubmit={ async (values, { setSubmitting }) => {
                                        console.log(values)
                                        setSubmitting(false)
                                    }
                                }>
                                    <Form>
                                        <Space direction="vertical" style={{ width: '100%'}}>
                                            <InputWrapper name="link" placeholder="URL" maxLength={200} />
                                            <InputWrapper name="link_text" placeholder="Name displayed on the URL" maxLength={50} />                           
                                            <SubmitWrapper key="submit" type="primary">
                                                Add Link
                                            </SubmitWrapper>
                                        </Space>
                                    </Form>
                                </Formik>)
                        }
                        </Space>
                    </Space>
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
            <Item label="maximum vehicle age (years)">
                <EditableText value={data.vehicle_age} />
            </Item>
            <Item label="total tax rate">
                <Space align="baseline">
                    <Text level={5}>PST + GST</Text>
                    <EditableText value="13" />
                </Space>
            </Item>
            <Item label="base fare">
                <EditableText value="13" />
            </Item>
            <Item label="driver pay rate">
                <EditableText value="13" />
            </Item>
            <Item label="recruitment email address">
                <EditableText value="city@uridetech.com" />
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
//console.log(data)
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