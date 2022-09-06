import { 
    Button, 
    Collapse,
    Badge,
    Image, 
    Row, 
    Col,
    Modal, 
    Input, 
    Form,
    Tag,
    Typography,
} from 'antd' // Import antd components
import DocumentList from "../../hoc/DocumentList" // import DocumentList HOC
import DocViewer from '../DocViewer' // import document viewer component

const { Panel } = Collapse // Destructure Panel from Collapse
const { Title } = Typography // Destructure Title from Typography

const Document = (props) => {
    console.log(props)

    const tagConfig = {
        style: {
            textTransform: 'capitalize'
        }
    }

    props.status === 'approved' ?
     tagConfig.color = 'success' : 
     props.status === 'rejected' ?
     tagConfig.color = 'error': 
        props.status === 'rejected' ?
        tagConfig.color = 'error':
        tagConfig.color = 'warning'

    return (
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
                    <DocViewer />
                </Row>
                <Row gutter={16}>
                    <Col className="gutter-row" span={12}>
                        <Button block type="danger" size="large">
                            Reject Document
                        </Button>
                    </Col>
                    <Col className="gutter-row" span={12}>
                        <Button block type="primary" size="large">
                            Approve Document
                        </Button>
                    </Col>
                </Row>
            </Panel>
        </Collapse>
    )
}

export default DocumentList(Document) // wrap Document component with DocumentList HOC