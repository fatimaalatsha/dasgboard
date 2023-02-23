import { useState } from 'react'
import { Card, theme, Space, Row, Typography, Tag, Avatar, Modal } from 'antd'
import { ArrowRightOutlined } from '@ant-design/icons'

const { useToken } = theme
const { Text, Title } = Typography
const { Group } = Avatar

const CellShift = (props) => {
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

    
    const [hours, setHours] = useState(1);
    const [isHovering, setIsHovering] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
  
    const handleClick = () => {
        setIsHovering(!isHovering)
        showModal()
    }

    const handleHoursChange = (event) => {
      setHours(event.target.value)
    }

    const showModal = () => {
      setIsModalOpen(true)
    }

    const handleOk = () => {
      setIsModalOpen(false)
    }

    const handleCancel = () => {
      setIsModalOpen(false)
    }
  
    const floatingComponentHeight = hours * 55;

    return (
        <>
            <div className="container" >
            <div className="clickable-div" style={{ width: '100%', height: 10, }} onClick={handleClick}></div>
            {isHovering && (
                <>
                <div className="floating-component" style={{ border: "1px solid red", position: 'absolute', top: 0, zIndex: 999, width: '100%' }}>
                    <div className="content" style={{ height: floatingComponentHeight, float: 'left', border: "1px solid green", width: '50%' }}>
                        <p>Shift</p>
                        {/* <input type="number" value={hours} min={1} max={8} onChange={handleHoursChange} /> */}
                    </div>
                    <div className="content" style={{ height: floatingComponentHeight, float: 'left', border: "1px solid blue", width: '50%' }}>
                        <p>Shift</p>
                        {/* <input type="number" value={hours} min={1} max={8} onChange={handleHoursChange} /> */}
                    </div>
                </div>
                </>
            )}
            </div>
            <Modal title="Basic Modal" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
                <input type="number" value={hours} min={1} max={8} onChange={handleHoursChange} />
            </Modal>

{/* <Card 
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
        </Card> */}
        </>
    )
}

export default CellShift