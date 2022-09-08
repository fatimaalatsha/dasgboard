import { useState } from 'react'
import { 
    Button, 
    Collapse,
    Row, 
    Col,
    Modal,
    Tag,
    Typography,
} from 'antd' // Import antd components
import { Auth } from 'aws-amplify'// Import Amplify auth method
import { Formik, Form } from 'formik' // Import Formik form components
import { object, string } from 'yup'

import DocumentList from "../../hoc/DocumentList" // import DocumentList HOC
import DocViewer from '../DocViewer' // import document viewer component
import SelectWrapper from '../forms/SelectWrapper' // Import SelectWrapper component
import SubmitWrapper from '../forms/SubmitWrapper' // Import SubmitWrapper component
import API from '../../api/BaseUrl' // Import API base URL

const { Panel } = Collapse // Destructure Panel from Collapse
const { Title } = Typography // Destructure Title from Typography

const Document = (props) => {
    const [isModalVisible, setIsModalVisible] = useState(false) // Set modal state to false
    const [documentStatus, setDocumentStatus] = useState({// Set document status state manager
        status: props.status,
        color: props.color,
        active: null,
    }) 
    //console.log(props)

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
        <Collapse activeKey={documentStatus.active} onChange={handleCollapseChange}>
            <Panel header={
                <Title level={5}>
                    {props.document?.title}
                </Title>
            }
            extra={
                <Tag {...tagConfig}>
                    {documentStatus.status}
                </Tag>
            }
            >
                <Row>
                    <DocViewer objectKey={`${props.sub}/${props.key1}`} />
                </Row>
                {
                    props.key2 && (
                        <Row>
                            <DocViewer objectKey={`${props.sub}/${props.key2}`} />
                        </Row>
                    )
                }
                <Row gutter={16}>
                    <Col className="gutter-row" span={12}>
                        <Button block type="danger" size="large"
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
                })
            }}
        >
            <Modal
                title={`Reject: ${props.document?.title}`}
                visible={isModalVisible}
                onOk={() => setIsModalVisible(false)}
                onCancel={() => setIsModalVisible(false)}
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
                        <SelectWrapper 
                            name="notes_public"
                        />
                    </Form>
            </Modal>
        </Formik>
        </>
    )
}

export default DocumentList(Document) // wrap Document component with DocumentList HOC