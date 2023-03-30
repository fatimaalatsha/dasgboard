import { useState } from "react"
import { Timeline, Card, Space, Input, message, Typography, Spin, Empty } from "antd"

import { Formik, Form , Field, ErrorMessage } from 'formik' // Import Formik form components
import { object, string } from 'yup' // Import Formik validation schema

import dayjs from 'dayjs' // Import date handlers
import utc from 'dayjs/plugin/utc' // Import dayjs utc plugin

import Select from "../forms/SelectWrapper" // Import custom formik select components
import Submit from "../forms/SubmitWrapper" // Import custom formik submit components
import notes_types from "../../assets/data/notes_types" // Import notes types for select options

import useFetch from "../../hooks/use-new-fetch" // Import useNewFetch hook
import { createDriverNotes } from "../../utils/driver-status"


const { Text } = Typography
const { TextArea } = Input

const items = [
    {
        note_type: "Follow Up",
        note_description: "Driver details updated",
        note_date: "2023-03-10 08:32:45",

    },
    {
        note_type: "Incident",
        note_description: "Driver details updated",
        note_date: "2023-03-09 21:17:12",
    },
    {
        note_type: "Initial Contact",
        note_description: "Driver details updated",
        note_date: "2023-03-08 14:55:34",

    },
    {
        note_type: "Follow Up",
        note_description: "Driver details updated",
        note_date: "2023-03-07 11:45:09",
    },
    {
        note_type: "Follow Up",
        note_description: "Driver details updated",
        note_date: "2023-03-06 18:26:58",

    },
    {
        note_type: "Follow Up",
        note_description: "Driver details updated",
        note_date: "2023-03-05 06:38:22",
    },
    {
        note_type: "Follow Up",
        note_description: "Driver details updated",
        note_date: "2023-03-04 15:22:37",

    },
    {
        note_type: "Follow Up",
        note_description: "Driver details updated",
        note_date: "2021-01-01 12:00:00",
    },
    {
        note_type: "Follow Up",
        note_description: "Driver details updated",
        note_date: "2021-01-01 12:00:00",

    },
    {
        note_type: "Follow Up",
        note_description: "Driver details updated",
        note_date: "2021-01-01 12:00:00",
    },
    {
        note_type: "Initial Information",
        note_description: "Driver details updated",
        note_date: "2021-01-01 12:00:00",

    },
    {
        note_type: "Initial Information",
        note_description: "Driver details updated",
        note_date: "2021-01-01 12:00:00",
    },
]

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
                console.log(values)
                await createDriverNotes(driverId,values)
                .then(res => {
                    console.log(res)
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
    const { data, error, loading, refetch } = useFetch(`/v1/drivers/${id}/notes`)
    const [ notes, setNotes ] = useState(items)
    console.log(data)
    
    if (loading) return <Spin />
    if (error) return <div>failed to load</div>

    return (
        <Card 
            title="Notes" 
            style={{ height: '100%', width: '100%', overflowY: 'hidden' }}
            bodyStyle={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', position: 'relative', overflowY: 'scroll', padding: 0 }}
        >
        <AddNewNote driverId={id} refetch={refetch} />
            <Space
                direction="vertical" 
                style={{ width: '100%', flex: 1, minWidth: 0, minHeight: 0, position: 'absolute', top: 200, padding: 24 }} 
            >
                <Timeline>
                    {
                        data.items?.length === 0 ? <Empty /> :
                        data.items?.map((item, index) => (
                            <Timeline.Item key={index}>
                                <Space size={2} direction="vertical">
                                    <Text strong>{dayjs(item.created_at).format('dddd DD, MMM YYYY - HH:mm')}</Text>
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