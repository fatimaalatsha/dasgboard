import { Card, theme, Space, Row, Typography, Tag, Avatar } from 'antd'
import { ArrowRightOutlined } from '@ant-design/icons'

const { useToken } = theme
const { Text, Title } = Typography
const { Group } = Avatar

const CellShift = () => {
    const { token } = useToken()

    const cardStyleConfig = {
        backgroundColor: token.colorSuccessBg,
        borderColor: token.colorSuccessBorder,
        color: token.colorSuccessText,
        height: '100%',
    }

    const errorStyleConfig = {
        backgroundColor: token.colorErrorBg,
        borderColor: token.colorErrorBorder,
        color: token.colorErrorText,
        height: '100%',
    }

    return (
        <Card 
            style={cardStyleConfig}
            bodyStyle={{ display: 'flex', gap: 16, flexDirection: 'column', justifyContent: 'flex-end', height: '100%' }}
        >
            <Row style={{ display: 'flex', height: '100%'}}>
            <Space direction="vertical" style={{ display: 'flex', width: '100%', alignItems: 'flex-end' }}>
                <Title level={4} style={{ margin: 0, color: 'inherit' }}>45 / 50</Title>
                <Space>
                    <Text strong style={{ color: 'inherit' }}>10:00</Text>
                    <ArrowRightOutlined />
                    <Text strong style={{ color: 'inherit' }}>18:00</Text>
                </Space>
            </Space>
            </Row>
            <Row>
                <Space>
                    <Tag color="cyan">0</Tag>
                    <Tag color="magenta">0</Tag>
                    <Tag color="gold">0</Tag>
                </Space>
            </Row>
            <Row>
                <Group>
                    <Avatar src="https://joesch.moe/api/v1/random" />
                    <Avatar
                    style={{
                        backgroundColor: '#f56a00',
                    }}
                    >
                        K
                    </Avatar>
                    <Avatar
                    style={{
                        backgroundColor: '#87d068',
                    }}
                    >
                        U
                    </Avatar>
                    <Avatar
                        style={{
                        backgroundColor: '#1890ff',
                        }}
                    >
                        A
                    </Avatar>
                </Group>
            </Row>
        </Card>
    )
}

export default CellShift