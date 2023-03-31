import { useState } from "react"
import { Timeline, Card, Space, Input, message, Typography, Empty, Button, Tooltip, Popconfirm, Checkbox } from "antd"
import { ReloadOutlined, FolderOutlined } from '@ant-design/icons' // Import Ant Icons

import { Formik, Form , Field } from 'formik' // Import Formik form components
import { object, string } from 'yup' // Import Formik validation schema

import dayjs from 'dayjs' // Import date handlers
import utc from 'dayjs/plugin/utc' // Import dayjs utc plugin

import Select from "../forms/SelectWrapper" // Import custom formik select components
import Submit from "../forms/SubmitWrapper" // Import custom formik submit components
import notes_types from "../../assets/data/notes_types" // Import notes types for select options

import useFetch from "../../hooks/use-new-fetch" // Import useNewFetch hook
import { createDriverNotes } from "../../utils/driver-status"

const { Text, Title } = Typography
const { TextArea } = Input

dayjs.extend(utc)

const AddNewNote = ({ driverId, refetch }) => {
    const initialValues = {
        note_type: '',
        note: '',
    }

    const noteSchema = object().shape({
        note_type: string().required('Note type is required'),
        note: string().required('Note description is required'),
    })

    const CustomTextArea = ({
        field, // { name, value, onChange, onBlur }
        form: { touched, errors }, // also values, setXXXX, handleXXXX, dirty, isValid, status, etc.
        ...props
      }) => (
        <>
            <TextArea {...field} {...props} />
            {touched[field.name] && errors[field.name] && <Text type="danger">{errors[field.name]}</Text>}
        </>
      )

    return (
        <Formik
            initialValues={initialValues}
            validationSchema={noteSchema}
            onSubmit={ async (values, { setSubmitting, resetForm }) => {
                setSubmitting(true)
                await createDriverNotes(driverId,values)
                .then(res => {
                    resetForm()
                    setSubmitting(false)
                    res && message.success('Note added successfully')
                    refetch()
                })
            }}
        >
            <Form style={{ position: 'sticky', top: 1, zIndex: 1 }}>
                <Space direction="vertical" size={8} style={{ width: '100%', background: '#FFF', padding: 8, boxShadow: '0 5px 4px 0 rgba(0,0,0,0.16)' }}>
                        <Select name="note_type" datasource={notes_types} placeholder="Select a note type" />
                        <Field name="note" component={CustomTextArea} placeholder="Include short description of interaction" rows={4} />
                        <Submit key="submit" type="primary" block>
                            Add Note
                        </Submit>
                </Space>
            </Form>
        </Formik>
    )
}

const DriverDetailsNotes = ({ id }) => {
    const { data, error, isLoading, refetch } = useFetch(`/v1/drivers/${id}/notes`)
    const [showArchived, setShowArchived] = useState(false)

    const refetchConfig = {
        icon: <ReloadOutlined />,
        onClick: () => refetch(),
        type: 'primary',
        ghost: true,
    }

    const archiveConfig = {
        icon: <FolderOutlined />,
        onClick: () => console.log('archive'),
        type: 'primary',
        ghost: true,
    }

    if (error) return <div>failed to load</div>

    const newItems = data.items?.map(item => ({...item, status: 'active'}))

    newItems?.unshift({
        "id": 1029,
        "admin_id": 23,
        "note_type": "Follow Up",
        "note": "Example of an archived note",
        "status": "archived",
        "created_at": "2023-03-31T21:17:47.916Z",
        "updated_at": "2023-03-31T21:17:47.916Z",
        "admin_name": "Alejandro Delgadillo"
    })

    const archivedItems = showArchived ? newItems : newItems?.filter((item) => item.status === 'active')

    return (
        <Card 
            title={
                <Space size={16} direction="vertical" style={{ width: '100%',  margin: '8px 0'}}>
                    <Space style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Title level={2} style={{ margin: 0 }}>Notes</Title>
                        <Tooltip title="Refresh">
                            <Button {...refetchConfig} />
                        </Tooltip>
                    </Space>
                    <Checkbox onChange={(e) => setShowArchived(e.target.checked)}><Text type="secondary" style={{ fontWeight: 'normal' }}>Show archived notes</Text></Checkbox>
                </Space>
            } 
            style={{ height: '100%', width: '100%', overflowY: 'hidden' }}
            bodyStyle={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', position: 'relative', overflowY: 'scroll', padding: 0 }}
            loading={isLoading}
        >
        <AddNewNote driverId={id} refetch={refetch} />
            <Space
                direction="vertical" 
                style={{ width: '100%', flex: 1, minWidth: 0, minHeight: 0, position: 'absolute', top: 200, padding: 24 }} 
            >
                <Timeline>
                    {
                        archivedItems?.length === 0 ? <Empty /> :
                        archivedItems?.map((item, index) => (
                            <Timeline.Item key={index} color={item.status === 'archived' ? 'gray' : 'blue'} dot={item.status === 'archived' && <FolderOutlined />} >
                                <Space size={2} direction="vertical">
                                    <Space>
                                        <Text strong>{dayjs(item.created_at).format('dddd DD, MMM YYYY - HH:mm')}</Text>
                                        { item.status !== 'archived' && (
                                            <Tooltip title="Archive" placement="bottom">
                                                <Popconfirm
                                                    title="Archive Note"
                                                    description="Are you sure you want to archive this note?"
                                                    onConfirm={() => console.log('archive')}
                                                    okText="Yes"
                                                    cancelText="No"
                                                >
                                                        <Button {...archiveConfig} />
                                                </Popconfirm>
                                            </Tooltip>
                                        )}
                                    </Space>
                                    <Text type="secondary">{item.note_type}</Text>
                                    <Text>{item.note}</Text>
                                    <Text italic>{item.admin_name}</Text>
                                </Space>
                            </Timeline.Item>
                        ))
                    }
                </Timeline>
            </Space>
        </Card>
    )
}

export default DriverDetailsNotes