import { Card, theme, Space, Row, Typography, Tag, Avatar } from 'antd'

const { useToken } = theme
const { Text, Title } = Typography
const { Group } = Avatar

const CellShift = () => {
    const { token } = useToken()

    return (
        <Card 
            style={{ backgroundColor: token.colorSuccessBg, borderColor: token.colorSuccessBorder, color: token.colorSuccessText, height: '100%' }}
            bodyStyle={{ display: 'flex', gap: 16, flexDirection: 'column', justifyContent: 'space-between', height: '100%'}}
        >
            <Row>
            <Space direction="vertical" style={{ display: 'flex', width: '100%', alignItems: 'flex-end' }}>
                <Title level={4} style={{ margin: 0 }}>Shift</Title>
                <Text strong type="secondary">10:00 - 18:00</Text>
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