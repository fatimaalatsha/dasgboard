
import { useState } from 'react'
import { 
    Descriptions,
    Tag,
    Space,
    Button,
    List,
    Switch,
    Drawer,
    Image,
    Modal,
    Typography,
} from 'antd' // Import antd components
import { Formik, Form } from 'formik'   // Import Formik form components
import { object, string, number } from 'yup' // Import yup validation schema

import useFetch from "../../hooks/use-fetch" // Import useFetch custom hook
import { createVehicle, deleteVehicle, updateVehicle } from '../../utils/vehicle-status' // Import vehicle status functions

import SubmitWrapper from '../forms/SubmitWrapper' // Import SubmitWrapper component
import InputWrapper from '../forms/InputWrapper' // Import InputWrapper component
import SelectWrapper from '../forms/SelectWrapper' // Import SelectWrapper component

import EditableText from '../EditableText' // Import EditableText component
import EditableSelect from '../EditableSelect' // Import EditableSelect component

const vehicleSchema = object().shape({
    plate_number: string().required('Required'),
    year: string().required('Required'),
    color: string().required('Required'),
    make_id: number().required('Required'),
    model_id: number().required('Required'),
    user_id: number().required('Required'),
})

const VehicleMakeFeeder = ({name, editable, value, handleUpdate}) => {
    const { data, isLoading, error } = useFetch(`/v1/makes`)// Call useFetch custom hook

    if (isLoading) {
        return <>Loading...</>
    }

    if (error) {
        return <>Something went wrong</>
    }

    if (editable) {
        return  <EditableSelect name={name} options={data.items} value={value} updateCallback={handleUpdate} />
    }
    
    return (
        <SelectWrapper name={name} datasource={data.items} placeholder="Vehicle Make" searchable="true" />
    )
}

const VehicleModelFeeder = ({name, make_id, editable, value, handleUpdate}) => {
    const { data, isLoading, error } = useFetch(`/v1/makes/${make_id}/models`)// Call useFetch custom hook

    if (isLoading) {
        return <>Loading...</>
    }

    if (error) {
        return <>Something went wrong</>
    }

    if (editable) {
        return  <EditableSelect name={name} options={data.models} value={value} updateCallback={handleUpdate} />
    }
    
    return (
        <SelectWrapper name={name} datasource={data.models} placeholder="Vehicle Model" searchable="true" />
    )
}

const VehicleList = ({vehicle, setOpen, open, refetch}) => {
    const [makeId, setMakeId] = useState(vehicle.make?.id)
    const [isModalVisible, setIsModalVisible] = useState(false) // Set modal state to false
    
    const showWarning = (make, model, plateNumber) => {
        Modal.confirm({
            title: 'Delete vehicle?',
            content: 
                <Space direction="vertical">
                <Text>
                    {`Are you sure you want to delete `} <Text mark strong>{`${make} ${model} ${plateNumber}`}</Text>{` ?`}
                </Text>
                <Text strong>
                    {`This action cannot be undone.`}
                </Text>
                </Space>
                ,
            onOk: async () => {
                const response = await deleteVehicle(vehicle.vehicleId)
                if(response) {
                    refetch()
                }
            },
            onCancel: () => {
                //console.log('Cancel')
            },
            okText: 'Yes, Delete',
            cancelText: 'Cancel',
        })
    }

    const showConfirm = (status) => {
      setOpen({ ...open, switch: true })
        Modal.confirm({
            title: 
                <Title level={4}>
                    {`Are you sure you want to change the status to `}
                    <Text style={{ textTransform: 'capitalize'}} mark strong>{status}?</Text>
                </Title>,
            content: 'This action cannot be undone',
            onOk: async () => {
                await updateVehicle({'status': status}, vehicle.vehicleId)
                .then((response) => {
                if (response) {
                    setOpen({ ...open, switch: false })
                    refetch()
                }
                })
            },
            onCancel() {
                setOpen({ ...open, switch: false })
                //console.log('Cancel')
                refetch()
            },
        });
    }

    const handleUpdate = async (newValue) => {
        if(Object.keys(newValue)[0] === 'model_id') {
            setMakeId(newValue.make_id)
        }
        await updateVehicle(newValue, vehicle.vehicleId)
        .then((response) => {
            if (response) {
                refetch()
            }
        })
    }

    const selectModel = async (value) => {
        const { make_id } = value
        console.log(make_id)
        setMakeId(make_id)
        return setIsModalVisible(true)
    }

    const modelSchema = object().shape({
        model_id: number().required('Required')
    })

    return (
        <>
        <List.Item
            actions={[
                <Button 
                    disabled={vehicle.status === 'active'} 
                    type="primary" 
                    size="small" 
                    danger ghost 
                    onClick={() => showWarning(vehicle.make?.name, vehicle.model?.name, vehicle.plate_number)}
                >
                    Delete
                </Button>,
                <Button disabled type="primary" size="small" /* onClick={() => setOpen({...open, drawer: true})} */>View</Button>,
                <Switch 
                    defaultChecked={vehicle.status === 'active'} 
                    loading={open.switch} 
                    disabled={vehicle.status === 'active'}
                    onChange={() => {
                        showConfirm('active')
                    }} 
                />
            ]}
        >
            <Descriptions labelStyle={{ fontWeight:'bold' }} >
                <Descriptions.Item label="Plate Number">
                    <EditableText name='plate_number' value={vehicle.plate_number} updateCallback={value => handleUpdate(value)} />
                </Descriptions.Item>
                <Descriptions.Item label="Make">
                    <VehicleMakeFeeder name='make_id' value={vehicle.make?.name} handleUpdate={selectedValue => selectModel(selectedValue)} editable />
                </Descriptions.Item>
                <Descriptions.Item label="Model">
                    {
                        vehicle.make?.id && <VehicleModelFeeder name='model_id' make_id={vehicle.make?.id} value={vehicle.model?.name} handleUpdate={selectedValue => handleUpdate(selectedValue)} editable />
                    }
                </Descriptions.Item>
                <Descriptions.Item label="Year">
                    <EditableText name='year' value={vehicle.year} updateCallback={value => handleUpdate(value)} />
                </Descriptions.Item>
                <Descriptions.Item label="Color">
                    <EditableText name='color' value={vehicle.color} updateCallback={value => handleUpdate(value)} />
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                    <Tag 
                        style={{ textTransform: 'capitalize'}} 
                        color={vehicle.status === 'active' ? 'green' : 'red'}
                    >
                        {vehicle.status}
                    </Tag>
                </Descriptions.Item>
            </Descriptions>
        </List.Item>
        {/* <Drawer title="Basic Drawer" placement="right" onClose={() => setOpen({...open, drawer: false})} visible={open.drawer}>
            {
                [...Array(8)].map((_, i) => (
                    <Space size="large" key={i}>
                    <Image
                        width={200}
                        height={200}
                        src="error"
                        fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3PTWBSGcbGzM6GCKqlIBRV0dHRJFarQ0eUT8LH4BnRU0NHR0UEFVdIlFRV7TzRksomPY8uykTk/zewQfKw/9znv4yvJynLv4uLiV2dBoDiBf4qP3/ARuCRABEFAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghggQAQZQKAnYEaQBAQaASKIAQJEkAEEegJmBElAoBEgghgg0Aj8i0JO4OzsrPv69Wv+hi2qPHr0qNvf39+iI97soRIh4f3z58/u7du3SXX7Xt7Z2enevHmzfQe+oSN2apSAPj09TSrb+XKI/f379+08+A0cNRE2ANkupk+ACNPvkSPcAAEibACyXUyfABGm3yNHuAECRNgAZLuYPgEirKlHu7u7XdyytGwHAd8jjNyng4OD7vnz51dbPT8/7z58+NB9+/bt6jU/TI+AGWHEnrx48eJ/EsSmHzx40L18+fLyzxF3ZVMjEyDCiEDjMYZZS5wiPXnyZFbJaxMhQIQRGzHvWR7XCyOCXsOmiDAi1HmPMMQjDpbpEiDCiL358eNHurW/5SnWdIBbXiDCiA38/Pnzrce2YyZ4//59F3ePLNMl4PbpiL2J0L979+7yDtHDhw8vtzzvdGnEXdvUigSIsCLAWavHp/+qM0BcXMd/q25n1vF57TYBp0a3mUzilePj4+7k5KSLb6gt6ydAhPUzXnoPR0dHl79WGTNCfBnn1uvSCJdegQhLI1vvCk+fPu2ePXt2tZOYEV6/fn31dz+shwAR1sP1cqvLntbEN9MxA9xcYjsxS1jWR4AIa2Ibzx0tc44fYX/16lV6NDFLXH+YL32jwiACRBiEbf5KcXoTIsQSpzXx4N28Ja4BQoK7rgXiydbHjx/P25TaQAJEGAguWy0+2Q8PD6/Ki4R8EVl+bzBOnZY95fq9rj9zAkTI2SxdidBHqG9+skdw43borCXO/ZcJdraPWdv22uIEiLA4q7nvvCug8WTqzQveOH26fodo7g6uFe/a17W3+nFBAkRYENRdb1vkkz1CH9cPsVy/jrhr27PqMYvENYNlHAIesRiBYwRy0V+8iXP8+/fvX11Mr7L7ECueb/r48eMqm7FuI2BGWDEG8cm+7G3NEOfmdcTQw4h9/55lhm7DekRYKQPZF2ArbXTAyu4kDYB2YxUzwg0gi/41ztHnfQG26HbGel/crVrm7tNY+/1btkOEAZ2M05r4FB7r9GbAIdxaZYrHdOsgJ/wCEQY0J74TmOKnbxxT9n3FgGGWWsVdowHtjt9Nnvf7yQM2aZU/TIAIAxrw6dOnAWtZZcoEnBpNuTuObWMEiLAx1HY0ZQJEmHJ3HNvGCBBhY6jtaMoEiJB0Z29vL6ls58vxPcO8/zfrdo5qvKO+d3Fx8Wu8zf1dW4p/cPzLly/dtv9Ts/EbcvGAHhHyfBIhZ6NSiIBTo0LNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiECRCjUbEPNCRAhZ6NSiAARCjXbUHMCRMjZqBQiQIRCzTbUnAARcjYqhQgQoVCzDTUnQIScjUohAkQo1GxDzQkQIWejUogAEQo121BzAkTI2agUIkCEQs021JwAEXI2KoUIEKFQsw01J0CEnI1KIQJEKNRsQ80JECFno1KIABEKNdtQcwJEyNmoFCJAhELNNtScABFyNiqFCBChULMNNSdAhJyNSiEC/wGgKKC4YMA4TAAAAABJRU5ErkJggg=="
                    />
                    </Space>
                ))
            }
        </Drawer> */}
        <Formik
            initialValues={{
                model_id: '',
            }}
            validationSchema={modelSchema}
            onSubmit={async (values, { setSubmitting }) => {
                await updateVehicle({make_id: makeId, ...values}, vehicle.vehicleId)
                .then((response) => {
                    if (response) {
                        setIsModalVisible(false)
                        setSubmitting(false)
                        refetch()
                    }
                })
            }}
        >
            <Modal
                title={`Select a vehicle model.`}
                visible={isModalVisible}
                onOk={() => setIsModalVisible(false)}
                onCancel={() => setIsModalVisible(false)}
                destroyOnClose={true}
                footer={[
                    <Button key="back" onClick={() => setIsModalVisible(false)}>
                        Cancel
                    </Button>,
                    <SubmitWrapper key="submit" type="primary">
                        Submit
                    </SubmitWrapper>,
                ]}
            >
                    <Form>
                        <VehicleModelFeeder name="model_id" make_id={makeId} />
                    </Form>
            </Modal>
        </Formik>
        </>
    )
}

const { Title, Text } = Typography // Destructure Title from Typography

const DriverVehicle = ({ id }) => {
    const { data, isLoading, error, refetch } = useFetch(`/v1/drivers/cc/${id}/vehicles`)// Call useFetch custom hook
    const [open, setOpen] = useState({// Drawer state manager
        drawer: false,
        modal: false,
        switch: false,
    })

    const initialValues = { // Set initial values for form
        plate_number: '',
        year: '',
        color: '',
        make_id: '',
        model_id: '',
        user_id: id,
    }

    if (isLoading) {
        return <>Loading...</>
    }

    if (error) {
        return <>Something went wrong</>
    }
    
    return (
        <Space direction='vertical' style={{ display: 'flex', width: '100%', alignItems: 'center'}}>
            <List 
                dataSource={data.items} 
                renderItem={item => (
                    <VehicleList vehicle={item} setOpen={setOpen} open={open} refetch={refetch} />
                )}
            />
            <Button onClick={() => setOpen({...open, modal: true})} >Add New Vehicle</Button>
            <Formik
                initialValues={initialValues}
                validationSchema={vehicleSchema}
                onSubmit={ async (values, { setSubmitting }) => {
                    await createVehicle(values).then((response) => {
                        if(response) {
                            setSubmitting(false)
                            setOpen({...open, modal: false})
                            refetch()
                        }
                    })
                }}
            >
                { props => (
                    <Form>
                        <Modal 
                            title="Add New Vehicle" 
                            visible={open.modal} 
                            onCancel={() => setOpen({...open, modal: false})}
                            destroyOnClose={true}
                            footer={[
                                <Button key="back" onClick={() => setOpen({...open, modal: false})}>
                                    Cancel
                                </Button>,
                                <SubmitWrapper key="submit" type="primary">
                                    Add Vehicle
                                </SubmitWrapper>,
                            ]}
                        >
                            <Space direction='vertical' style={{ width: '100%'}}>
                                <InputWrapper name="plate_number" placeholder="Plate Number" maxLength={20} />
                                <VehicleMakeFeeder name="make_id" />
                                { props.values.make_id && <VehicleModelFeeder name="model_id" make_id={props.values.make_id} />}
                                <InputWrapper name="year" placeholder="Year" year="true" />
                                <InputWrapper name="color" placeholder="Color" maxLength={20} />
                            </Space>
                        </Modal>
                    </Form>
                )}
            </Formik>
        </Space>
    )
}

export default DriverVehicle