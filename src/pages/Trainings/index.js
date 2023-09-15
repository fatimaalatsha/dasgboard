import { Card, Table, Tag, Button, Tooltip, Space , Modal, Radio, Divider, message } from 'antd' // Import Ant components
import { ReloadOutlined } from '@ant-design/icons' // Import Ant Icons
import dayjs from "dayjs"// Import date handlers
import useFetch from '../../hooks/use-new-fetch'// Import useFetch custom hook

import React ,{ useState } from 'react'; // Import React
import { useNavigate } from 'react-router-dom'; // Import Nav component

import {object, string, array, number, boolean} from 'yup'; // Import Yup validation library

import SubmitWrapper from '../../components/forms/SubmitWrapper' // Import SubmitWrapper component
import InputWrapper from '../../components/forms/InputWrapper' // Import InputWrapper component
import { CitySelect } from '../../components/CitySelect' // City selector
import { createTraining } from '../../utils/training-status'

import { Formik, Form as FormikForm } from 'formik'   // Import Formik form components

const tableColumns = [
    {
        title: 'Name',
        dataIndex: 'title',
    },
    {
        title: 'Cities',
        dataIndex: 'city_id',
        render: (city_id) => city_id ?? <Tag color="blue">All Cities</Tag>,
    },
    {
        title: 'Status',
        dataIndex: 'status',
        align: 'center',
        render: (status) => <Tag color={status === 'active' ? 'green' : 'red'}>{status.toUpperCase()}</Tag>,
    },
    {
        title: 'Updated At',
        dataIndex: 'updated_at',
        render: (text, record) => `${dayjs(text).format('YYYY-MM-DD - HH:mm:ss')}`,
        align: 'right',
    },
]

//validationSchema for Formik
const trainingSchema = object().shape({
    title: string().required('Required'),
    url: string().required('Required'),
    global: boolean().required('Required'),
    city_id: array().of(number()).when('global', {
        is: false,
        then: array().min(1).of(number()).required('Required'),
        otherwise: array().of(number()).notRequired()
    }),
})

const AddTraining = ({refetch}) => {
    const [open, setOpen] = useState(false)

    const handleOpen = () => {
        setOpen(true)
    }

    const handleClose = () => {
        setOpen(false)
        refetch()
    }

    return (
        <>
            <Button
                onClick={handleOpen}
                type="primary"
                style={{ marginBottom: 20 }}
            >
                Add New Training
            </Button>
            {open && (
                <Formik
                    initialValues={{
                        title: '',
                        city_id: [],
                        url: '',
                        global: true,
                    }}
                    validationSchema={trainingSchema}
                    onSubmit={async (values, {setSubmitting, resetForm }) => {
                        const payload = {
                            'url': values.url,
                            'title': values.title,
                            'global': values.global,
                            ...(!values.global ? { 'city_id': values.city_id } : {})
                        }
                        await createTraining(payload).then((response) => {
                            message.success(response.message)
                            setSubmitting(false)
                            resetForm()
                            handleClose()
                        })
                    }}           
                >
                    {props => (
                        <FormikForm>
                            <Modal
                                title="Add New Training Video" 
                                open={open}
                                confirmLoading={props.isSubmitting}
                                onCancel={handleClose}
                                footer={[
                                    <Button key="cancel" onClick={handleClose}>
                                        Cancel
                                    </Button>,
                                    <SubmitWrapper key="submit" type="primary" >
                                        Add New Training Video
                                    </SubmitWrapper>,
                                ]}              
                            >
                                    <Space direction='vertical' style={{ width: '100%'}}>
                                        <InputWrapper type="text" name="title" placeholder="Title" />
                                        <InputWrapper type="text" name="url" placeholder="Video Link (from YouTube)" /> 
                                        <Divider> Scope </Divider>
                                        <Radio.Group
                                            style={{ width: '100%' }}
                                            onChange={ (e) => {
                                                props.setFieldValue('global', e.target.value)
                                            }}
                                            value={props.values.global}
                                        >
                                            <Space>
                                                <Radio value={true}>All cities</Radio>
                                                <Radio value={false}>Specific Cities</Radio>
                                            </Space>
                                        </Radio.Group>
                                        { !props.values.global && (
                                            <CitySelect
                                                onChange={(value) => {
                                                    props.setFieldValue('city_id', value)
                                                }}
                                                style={{ width: '100%' }}
                                                mode="multiple"
                                            />
                                        )} 
                                    </Space>
                            </Modal>
                        </FormikForm>
                    )}
                </Formik>
            )}
        </>
    )
}

const Trainings = () => {
    const { data, isLoading, error, refetch } = useFetch(`/v1/trainings`) // Fetch data from API
    const navigate = useNavigate() // navigate to video details page
    
    const buttonConfig = {
        icon: <ReloadOutlined />,
        onClick: () => refetch(),
        type: 'primary',
        ghost: true,
        size: 'large',
        style: {
            marginBottom: '16px',
        },
    }

    if (error) {
      return <div>Something went wrong...</div>
    }

    return (
        <Card title={'Trainings'} style={{ margin: 15 }}>
            <Space direction="vertical" style={{ paddingBottom: 16 }}>
                <Tooltip title="Reload data">
                    <Button {...buttonConfig} />
                </Tooltip>
                <AddTraining refetch={refetch}/>
            </Space>
            <Table
                columns={tableColumns}
                dataSource={data?.data}
                loading={isLoading}
                rowKey={(record) => record.id}
                rowClassName={() => 'clickable-row'}
                onRow={(record) => ({
                    onClick: () => navigate(`/training/${record.id}`)
                })}
            />
        </Card>
    )
}

export default Trainings