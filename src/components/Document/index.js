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
    //console.log(props)

    const tagConfig = {
        style: {
            textTransform: 'capitalize'
        },
        color: props.color
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
                console.log(data)
            }
        } catch (err) {
            console.log(err)
        }
    }

    return (
        <>
        <Collapse>
            <Panel header={
                <Row style={{ display: 'flex', width: '100%'}}>
                    <Col span={20}>
                        <Title level={5}>
                            {props.document?.title}
                        </Title>
                    </Col>
                    <Col span={4}>
                        <Tag {...tagConfig}>
                            {props.status}
                        </Tag>
                    </Col>
                </Row>
            }>
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
                console.log(values)
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