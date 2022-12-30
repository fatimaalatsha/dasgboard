import { useState } from 'react'
import { 
    Button, 
    Collapse,
    Row, 
    Col,
    Modal,
    Tag,
    Typography,
    Descriptions,
    Empty,
} from 'antd' // Import antd components
import { Auth } from 'aws-amplify'// Import Amplify auth method
import { Formik, Form } from 'formik' // Import Formik form components
import { object, string } from 'yup'

import DocumentList from "../../hoc/DocumentList" // import DocumentList HOC
import DocViewer from '../DocViewer' // import document viewer component
import SelectWrapper from '../forms/SelectWrapper' // Import SelectWrapper component
import SubmitWrapper from '../forms/SubmitWrapper' // Import SubmitWrapper component
import EditableDate from '../../components/EditableDate' // Import Driver contact information component
import API from '../../api/BaseUrl' // Import API base URL

const { Panel } = Collapse // Destructure Panel from Collapse
const { Text } = Typography // Destructure Text from Typography

const RejectFeeder = ({name}) => {
    const reasons = [
        { value: 'wrong document', text: 'Wrong document' },
        { value: 'image is too blurry', text: 'Image is too blurry' },
        { value: 'expired document', text: 'Expired document' },
        { value: 'unqualified licence class', text: 'Unqualified licence class' },
        { value: 'Below 25 - under age requirements', text: 'Below 25 - Under age requirements' },
        { value: 'unqualified vehicle year / 2-door', text: 'Unqualified vehicle year / 2-door' },
        { value: 'registered under a different name', text: 'Registered under a different name' },
        { value: 'insurance below 2M liability', text: 'Insurance below 2M liability' },
        { value: 'failed safety inspection', text: 'Failed safety inspection' },
        { value: 'failed background check', text: 'Failed background check' },
        { value: 'unqualified driver history/abstract', text: 'Unqualified driver history/abstract' },
    ]

    return (
        <SelectWrapper name={name} datasource={reasons} placeholder="Select a reason to reject the document" />
    )
}

const Document = (props) => {
    const [isModalVisible, setIsModalVisible] = useState(false) // Set modal state to false
    const [documentStatus, setDocumentStatus] = useState({// Set document status state manager
        status: props.status,
        color: props.color,
        active: null,
    }) 

    const tagConfig = {
        style: {
            textTransform: 'capitalize'
        },
        color: documentStatus.color
    }

    const rejectSchema = object().shape({
        notes_public: string().required('Required'),
    })

    const changeDocStatus = async (status, type, id, notes = '') => {
        try {
            const auth = await Auth.currentSession()// Get current session
            const token = auth.getAccessToken().getJwtToken()// Get token from session
            const options = { // Set options for fetch
                headers: {
                    'Authorization': token,
                    ...(process.env.REACT_APP_ENV && {'env': process.env.REACT_APP_ENV}),
                }
            }
            const body = {
                status,
                type,
                ...( notes && { notes_public: notes })
            }
            const response = await API.post(`/v1/documents/cc/${id}`, body, options)
            const data = await response.data
            if (data.success) {
                status === 'approved' ? setDocumentStatus({
                    status: 'approved',
                    color: 'success',
                    active: null,
                }) : setDocumentStatus({
                    status: 'rejected',
                    color: 'error',
                    active: null,
                })
            }
        } catch (err) {
            console.log(err)
        }
    }

    const handleCollapseChange = (key) => { // Handle collapse change
        setDocumentStatus({...documentStatus, active: key})
    }

    return (
        <>
        <Collapse activeKey={documentStatus.active} onChange={handleCollapseChange} collapsible={documentStatus.status === 'missing' && 'disabled'}>
            <Panel 
            header={props.document?.title}
            extra={
                <Tag {...tagConfig}>
                    {documentStatus.status}
                </Tag>
            }
            >
                <Row gutter={16}>
                    <Col span={12}>
                        <Row justify='center'>
                            <DocViewer objectKey={`${props.sub}/${props.key1}`} />
                        </Row>
                        {
                            props.key2 && (
                                <Row justify='center'>
                                    <DocViewer objectKey={`${props.sub}/${props.key2}`} />
                                </Row>
                            )
                        }
                    </Col>
                    <Col span={12}>
                        <Descriptions title='Document Details' layout='vertical' labelStyle={{ fontWeight:'bold' }}>
                            { props.document?.has_expiration && (
                                <Descriptions.Item label="Expiration Date">
                                    <EditableDate 
                                        name='expiration_date' 
                                        value={props.expiration_date} 
                                        updateCallback={async (value) => {
                                            await props.updateText(value, props.document.type, props.id)
                                                .then((response) => {
                                                    return response
                                                })
                                                .catch((err) => {
                                                    console.log(err)
                                                })
                                        }} 
                                    />
                                </Descriptions.Item>
                            )}
                            { props.notes_public && (
                                <Descriptions.Item label="Rejection Reason">
                                    <Text style={{ textTransform: 'capitalize' }} >{ props.notes_public }</Text>
                                </Descriptions.Item>
                            )}
                            { !props.document?.has_expiration && !props.notes_public && (
                                <Descriptions.Item>
                                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                                </Descriptions.Item>
                            )}
                        </Descriptions>
                    </Col>

                </Row>
                <Row gutter={16}>
                    <Col className="gutter-row" span={12}>
                        <Button block type="primary" danger size="large"
                            onClick={() => setIsModalVisible(true)}
                        >
                            Reject Document
                        </Button>
                    </Col>
                    <Col className="gutter-row" span={12}>
                        <Button block type="primary" size="large"
                            onClick={() => changeDocStatus('approved', props.document.type, props.id)}
                        >
                            Approve Document
                        </Button>
                    </Col>
                </Row>
            </Panel>
        </Collapse>
        <Formik
            initialValues={{
                notes_public: '',
            }}
            validationSchema={rejectSchema}
            onSubmit={async (values, { setSubmitting }) => {
                await changeDocStatus('rejected', props.document.type, props.id, values.notes_public)
                .then(() => {
                    setIsModalVisible(false)
                    setSubmitting(false)
                    props.refetch()
                })
            }}
        >
            <Modal
                title={`Reject: ${props.document?.title}`}
                open={isModalVisible}
                onOk={() => setIsModalVisible(false)}
                onCancel={() => setIsModalVisible(false)}
                destroyOnClose={true}
                footer={[
                    <Button key="back" onClick={() => setIsModalVisible(false)}>
                        Cancel
                    </Button>,
                    <SubmitWrapper key="submit" type="primary">
                        Submit
                    </SubmitWrapper>,
                ]}
            >
                    <Form>
                        <RejectFeeder name="notes_public" />
                    </Form>
            </Modal>
        </Formik>
        </>
    )
}

export default DocumentList(Document) // wrap Document component with DocumentList HOC