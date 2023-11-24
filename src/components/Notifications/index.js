import { useState } from "react"
import { Button, Badge, Drawer, Segmented, List, Typography, Space } from "antd"

import { BellOutlined } from '@ant-design/icons'
import UnreadIcon from "../icons/UnreadIcon"
import ReadIcon from "../icons/ReadIcon"

const { Title, Text, Paragraph } = Typography

const ListItem = ({ data }) => {
    const [open, setOpen] = useState({
        expand: false,
        data: {
            title: '',
            date: '',
            content: '',
        }
    })

    const handleOpen = (data) => {
        setOpen({...open, expand: true, data})
    }

    const handleClose = () => {
        setOpen({...open, expand: false})
    }

    return (
        <>
            <List
                itemLayout="horizontal"
                dataSource={data}
                renderItem={(item, idx) => (
                    <List.Item
                        actions={[
                            <Button 
                                type="primary" 
                                ghost 
                                onClick={() => handleOpen(item)}
                            >
                                Expand
                            </Button>
                        ]}
                    >
                        <List.Item.Meta 
                            title={
                                <Space 
                                    direction="vertical"
                                    size={1}
                                >
                                    <Text type="secondary">{item.date}</Text>
                                    <Title level={5} style={{ marginTop: 0 }}>{item.title}</Title>
                                </Space>
                            }
                            description={
                                <Paragraph
                                    ellipsis
                                >
                                    {item.content}
                                </Paragraph>
                            }
                        />
                    </List.Item>
                )}
            >
            </List>
            <Drawer
                title={open.data.title}
                width={320}
                closable={false}
                onClose={handleClose}
                open={open.expand}
            >
                <Text type="secondary">{open.data.date}</Text>
                <Paragraph>
                    {open.data.content}
                </Paragraph>
            </Drawer>
        </>
    )
}

const Notifications = () => {
    const [open, setOpen] = useState(false)
    const [section, setSection] = useState(0)

    const segmentOptions = [
        {
            value: 0,
            label: 'Unread',
            icon: <UnreadIcon />
        },
        {
            value: 1,
            label: 'Read',
            icon: <ReadIcon />
        }
    ]

    const data = [...Array(10)].map((_, idx) => ({
        title: `Notification ${idx}`,
        content: 'Driver submitted insurance documents Driver submitted insurance documents Driver submitted insurance documents', 
        date: 'Fri, Nov 23, 2023 - 13:30'
    }))

    const handleOpen = () => {
        setOpen(true)
    }

    const handleClose = () => {
        setOpen(false)
    }

    return (
        <>
            <Badge
                count={8}
            >
                <Button 
                    size="large"
                    icon={<BellOutlined />}
                    onClick={handleOpen}
                />
            </Badge>
            <Drawer
                title={
                    <Segmented 
                        block
                        options={segmentOptions}
                        value={section}
                        onChange={setSection}
                    />
                }
                placement="right"
                size="large"
                onClose={handleClose}
                open={open}
            >
                { !section ? (
                    <ListItem data={data} />
                ) : (
                    <ListItem data={data} />
                )
                }
            </Drawer>
        </>
    )
}

export default Notifications