import { useState, useEffect } from "react"
import { Button, Badge, Drawer, Segmented, List, Typography, Space, notification, Modal } from "antd"

import { BellOutlined, PlusOutlined } from '@ant-design/icons'
import dayjs from "dayjs"
import { Form as FormikForm, Formik } from "formik"

import UnreadIcon from "../icons/UnreadIcon"
import ReadIcon from "../icons/ReadIcon"

import  { pathUrl } from "../../api/path-url"
import useMessages from "../../hooks/use-messages"

import InputWrapper from "../forms/InputWrapper"
import { CitySelect } from "../CitySelect"
import DriverSelect from "../DriverSelect"
import SubmitWrapper from "../forms/SubmitWrapper"

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
    const [open, setOpen] = useState({
        drawer: false,
        modal: false
    })
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

    const handleOpen = (section) => {
        setOpen({...open, [section]: true})
    }

    const handleClose = (section) => {
        setOpen({...open, [section]: false})
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
                    onClick={() => handleOpen('drawer')}
                />
            </Badge>
            <Drawer
                title={
                    <Segmented 
                        options={segmentOptions}
                        value={section}
                        onChange={setSection}
                    />
                }
                placement="right"
                size="large"
                onClose={() => handleClose('drawer')}
                open={open.drawer}
                extra={
                    <Space>
                        <Button 
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => handleOpen('modal')}
                        >
                            Message
                        </Button>
                    </Space>
                }
            >
                { !section ? (
                    <ListItem data={data.data} />
                ) : (
                    <ListItem data={data.data} />
                )
                }
            </Drawer>
            { open.modal && (
                <Formik
                    initialValues={{
                        title: '',
                        message: '',
                        city_id: null,
                        status: '',
                        drivers: []
                    }}
                    onSubmit={ async (values, { setSubmitting, resetForm }) => {
                        console.log(values)
                    }}
                >
                    { props => (
                        <FormikForm>
                            <Modal
                                title="New Message"
                                open={open.modal}
                                onCancel={() => handleClose('modal')}
                                destroyOnClose
                                footer={[
                                    <Button
                                        key="cancel"
                                        onClick={() => {
                                            handleClose('modal')
                                            props.resetForm()
                                        }}
                                    >
                                        Cancel
                                    </Button>,
                                    <SubmitWrapper
                                        key="create"
                                        type="primary"
                                        htmlType="submit"
                                        loading={props.isSubmitting}
                                    >
                                        Create
                                    </SubmitWrapper>
                                ]}
                            >
                                <Space 
                                    direction="vertical" 
                                    size={16}
                                    style={{
                                        width: '100%',
                                    }}
                                >
                                    <InputWrapper 
                                        name="title"
                                        placeholder="Title"
                                        type="text"
                                        value={props.values.title}
                                    />
                                    <CitySelect 
                                        style={{
                                            width: '100%'
                                        }}
                                        onChange={(value) => {
                                            props.setFieldValue('city_id', Number(value))
                                        }}
                                    />
                                    <DriverSelect 
                                        simple="true"
                                        disabled={!Boolean(props.values.city_id)}
                                        city_id={Number(props.values.city_id)}
                                        onChange={(value) => props.setFieldValue('drivers', value)}
                                    />
                                    <InputWrapper 
                                        name="message"
                                        placeholder="Message"
                                        textarea="true"
                                        value={props.values.message}
                                        rows={4}
                                    />
                                </Space>
                            </Modal>
                        </FormikForm>
                    )}
                </Formik>
            )}
        </>
    )
}

export default Notifications