import { useState, useEffect } from "react"
import { Button, Badge, Drawer, Segmented, List, Typography, Space, notification } from "antd"

import { BellOutlined } from '@ant-design/icons'
import dayjs from "dayjs"

import UnreadIcon from "../icons/UnreadIcon"
import ReadIcon from "../icons/ReadIcon"

import  { pathUrl } from "../../api/path-url"
import useMessages from "../../hooks/use-messages"

const { Title, Text, Paragraph } = Typography

const ListItem = ({ data }) => {
    const [open, setOpen] = useState({
        expand: false,
        data: {
            title: '',
            created_at: '',
            message: '',
        }
    })

    const handleOpen = (data) => {
        setOpen({...open, expand: true, data })
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
                                    <Text type="secondary">{dayjs(item.created_at).format('dddd DD, MMMM YYYY - HH:mm')}</Text>
                                    <Title level={5} style={{ marginTop: 0 }}>{item.title}</Title>
                                </Space>
                            }
                            description={
                                <Paragraph
                                    ellipsis
                                >
                                    {item.message}
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
                <Text type="secondary">{dayjs(open.data.created_at).format('dddd DD, MMMM YYYY - HH:mm')}</Text>
                <Paragraph>
                    {open.data.message}
                </Paragraph>
            </Drawer>
        </>
    )
}

const Notifications = () => {
    const [open, setOpen] = useState(false)
    const [section, setSection] = useState(0)

    const { data, isLoading, error } = useMessages(pathUrl.messages)

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

    /* const data = [...Array(10)].map((_, idx) => ({
        title: `Notification Title ${idx}`,
        content: 'Driver submitted insurance documents Driver submitted insurance documents Driver submitted insurance documents', 
        date: 'Fri, Nov 23, 2023 - 13:30'
    })) */

    const handleOpen = () => {
        setOpen(true)
    }

    const handleClose = () => {
        setOpen(false)
    }

    useEffect(() => {
        if(data?.data && data.data?.length !== 0) {
            notification.info({
                message: "Unread Notifications 📬",
                description: "You've got unread messages waiting for you!"
            })
        }
    }, [data])

    if (isLoading) {
        return <>Loading...</>
    }

    if (error) {
        return <>Error!</>
    }

    //console.log(data)

    return (
        <>
            <Badge
                count={data.data?.length}
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
                    <ListItem data={data.data} />
                ) : (
                    <ListItem data={data.data} />
                )
                }
            </Drawer>
        </>
    )
}

export default Notifications