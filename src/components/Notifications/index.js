import { useState, useEffect } from "react"
import { Button, Badge, Drawer, Segmented, List, Typography, Space, notification, Modal, message, Switch, Tooltip, Spin } from "antd"

import { BellOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons'
import dayjs from "dayjs"
import { Form as FormikForm, Formik } from "formik"
import { object, string, number, array, boolean } from 'yup' // Import Yup for form validation

import UnreadIcon from "../icons/UnreadIcon"
import ReadIcon from "../icons/ReadIcon"

import  { pathUrl } from "../../api/path-url"
import useNotification from "../../hooks/use-notification"

import InputWrapper from "../forms/InputWrapper"
import { CitySelect } from "../CitySelect"
import DriverSelect from "../DriverSelect"
import SubmitWrapper from "../forms/SubmitWrapper"

const { Title, Text, Paragraph } = Typography

const messageSchema = object().shape({
    title: string().required('Required'),
    message: string().required('Required'),
    city_id: number().required('Required'),
    specific_drivers: boolean().notRequired(),
    drivers: array().when('specific_drivers', {
        is: true,
        then: array().of(number()).min(1, 'Select at least 1 driver.').required('Required'),
        otherwise: array().notRequired()
    })
})

const ListItem = ({ 
    data, 
    update, 
    refetch,
    remove
 }) => {
    const [open, setOpen] = useState({
        expand: false,
        isDeleting: false,
        data: {
            title: '',
            created_at: '',
            message: '',
        }
    })
    
    const handleOpen = async (data) => {
        if (!data.is_read) {
            await update(data.id, { "is_read": true })
        }
        setOpen({...open, expand: true, data })
    }

    const handleClose = () => {
        setOpen({...open, expand: false, isDeleting: false})
        refetch()
    }

    const handleDelete = async (id) => {
        setOpen({...open, isDeleting: true})
        await remove(id)
        .then(response => {
            message.success(response.message)
            handleClose()
        })
        .catch(error => message.error(error.message))
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
                                    <Title level={5} style={{ marginTop: 0 }}>{item.message.title}</Title>
                                </Space>
                            }
                            description={
                                <Paragraph
                                    ellipsis
                                >
                                    {item.message.message}
                                </Paragraph>
                            }
                        />
                    </List.Item>
                )}
            >
            </List>
            <Drawer
                title={open.data.message.title}
                width={320}
                closable={false}
                onClose={handleClose}
                open={open.expand}
                extra={
                    <Tooltip title="Delete">
                        <Button 
                            type="primary" 
                            danger 
                            icon={<DeleteOutlined />}
                            loading={open.isDeleting}
                            onClick={() => handleDelete(open.data.id)}
                        />
                    </Tooltip>
                }
            >
                <Text type="secondary">{dayjs(open.data.created_at).format('dddd DD, MMMM YYYY - HH:mm')}</Text>
                <Paragraph>
                    {open.data.message.message}
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

    const { 
        data, 
        meta, // Use when pagination is required
        isLoading, 
        error, 
        refetch, 
        updateNotification, 
        deleteNotification 
    } = useNotification(`${pathUrl.notification}?paginated=false&sort[created_at]=desc`)

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
        return <Spin />
    }

    if (error) {
        return <>Error!</>
    }

    return (
        <>
            <Badge
                count={data.unread?.length}
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
                        {/* <Button // Hidden until messasing section is required
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => handleOpen('modal')}
                        >
                            Message
                        </Button> */}
                    </Space>
                }
            >
                { !section ? (
                    <ListItem 
                        data={data.unread}
                        update={updateNotification}
                        refetch={refetch}
                        remove={deleteNotification}
                    />
                ) : (
                    <ListItem 
                        data={data.read}
                        update={updateNotification}
                        refetch={refetch}
                        remove={deleteNotification}
                    />
                )
                }
            </Drawer>
            { open.modal && ( // FALSE until messaging section is required, move this to individual page.
                <Formik
                    initialValues={{
                        title: '',
                        message: '',
                        city_id: 0,
                        specific_drivers: false,
                        drivers: []
                    }}
                    validationSchema={messageSchema}
                    onSubmit={ async (values, { setSubmitting, resetForm }) => {
                        const payload = {
                            title: values.title,
                            message: values.message,
                            ...(values.specific_drivers ? 
                                { drivers_ids: values.drivers } 
                                : { city_id: values.city_id }
                            )
                        }
                        console.log(payload)
                        /* await createMessage(payload)
                            .then(() => {
                                message.success('Message created successfully')
                                setSubmitting(false)
                                resetForm()
                                handleClose('modal')
                                refetch()
                            })
                            .catch(() => {
                                message.error('Message could not be created')
                                setSubmitting(false)
                                resetForm()
                                handleClose('modal')
                                refetch()
                            }) */
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
                                            props.setFieldValue('drivers', [])
                                        }}
                                    />
                                    <div
                                        style={{
                                            width: '100%',
                                            display: 'flex',
                                            gap: 8,
                                            alignItems: 'center'
                                        }}
                                    >
                                        <DriverSelect 
                                            simple="true"
                                            disabled={!props.values.specific_drivers}
                                            city_id={Number(props.values.city_id)}
                                            onChange={(value) => props.setFieldValue('drivers', value)}
                                            style={{
                                                width: '100%'
                                            }}
                                        />
                                        <Tooltip title="Specific Drivers?">
                                            <Switch 
                                                disabled={!Boolean(props.values.city_id)}
                                                onChange={(checked) => props.setFieldValue('specific_drivers', checked)}
                                            />
                                        </Tooltip>
                                    </div>
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
            )
            }
        </>
    )
}

export default Notifications