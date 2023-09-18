
import { useState } from 'react'
import { 
    Descriptions,
    Tag,
    Space,
    Button,
    List,
    Switch,
    Drawer,
    Modal,
    Typography,
    Empty,
} from 'antd' // Import antd components
import { Formik, Form } from 'formik'   // Import Formik form components
import { object, string, number } from 'yup' // Import yup validation schema

import useFetch from "../../hooks/use-new-fetch" // Import useFetch custom hook
import { createVehicle, deleteVehicle, updateVehicle } from '../../utils/vehicle-status' // Import vehicle status functions

import SubmitWrapper from '../forms/SubmitWrapper' // Import SubmitWrapper component
import InputWrapper from '../forms/InputWrapper' // Import InputWrapper component
import SelectWrapper from '../forms/SelectWrapper' // Import SelectWrapper component
import DocViewer from '../DocViewer' // Import DocViewer component
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

const VehiclePhotosFeeder = ({vehicle, sub}) => {
    const { data, isLoading, error } = useFetch(`/v1/vehicles/photos/${vehicle}/vehicle`)// Call useFetch custom hook

    if (isLoading) {
        return <>Loading...</>
    }

    if (error) {
        return <>Something went wrong</>
    }

    return (
        <Space direction="vertical" size="large">
            {
                data.items.length !== 0 ? data.items.map((item, index) => (
                    <div key={index}>
                        <Title level={4} >{item.type?.title}</Title> 
                        <DocViewer key={index} objectKey={`${sub}/${item.key}`} />
                    </div>
                )) : <Empty />
            }
        </Space>
    )
}

const VehicleMakeFeeder = ({name, editable, value, handleUpdate}) => {
    const { data, isLoading, error } = useFetch(`/v1/makes`)// Call useFetch custom hook

    if (isLoading) {
        return <>Loading...</>
    }

    if (error) {
        return <>Something went wrong</>
    }

    if (editable) {
        return  <EditableSelect name={name} options={data.data} value={value} updateCallback={handleUpdate} />
    }
    
    return (
        <SelectWrapper name={name} datasource={data.data} placeholder="Vehicle Make" searchable="true" />
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
console.log(data)
    if (editable) {
        return  <EditableSelect name={name} options={data.items} value={value} updateCallback={handleUpdate} />
    }
    
    return (
        <SelectWrapper name={name} datasource={data.items} placeholder="Vehicle Model" searchable="true" />
    )
}

const VehicleList = ({ vehicle, setOpen, open, refetch, sub }) => {
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
                const response = await deleteVehicle(vehicle.vehicle_id)
                if(response) {
                    refetch()
                }
            },
            onCancel: () => {
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
                await updateVehicle({'status': status}, vehicle.vehicle_id)
                .then((response) => {
                if (response) {
                    setOpen({ ...open, switch: false })
                    refetch()
                }
                })
            },
            onCancel() {
                setOpen({ ...open, switch: false })
                refetch()
            },
        });
    }

    const handleUpdate = async (newValue) => {
        if(Object.keys(newValue)[0] === 'model_id') {
            setMakeId(newValue.make_id)
        }
        await updateVehicle(newValue, vehicle.vehicle_id)
        .then((response) => {
            if (response) {
                refetch()
            }
        })
    }

    const selectModel = async (value) => {
        const { make_id } = value
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
                <Button type="primary" size="small" onClick={ () => setOpen({...open, drawer: { open: true, id: vehicle.vehicle_id }}) }>View</Button>,                
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
                    <EditableText name='year' type="number" value={vehicle.year} updateCallback={value => handleUpdate(value)} />
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
         <Drawer destroyOnClose title="Vehicle Photos" placement="right" size="large" onClose={() => setOpen({...open, drawer: {open: false, id: null}})} open={open.drawer.open}>
            {
               open.drawer.id && <VehiclePhotosFeeder vehicle={open.drawer.id} sub={sub} />
            }
        </Drawer>
        <Formik
            initialValues={{
                model_id: '',
            }}
            validationSchema={modelSchema}
            onSubmit={async (values, { setSubmitting }) => {
                await updateVehicle({make_id: makeId, ...values}, vehicle.vehicle_id)
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
                open={isModalVisible}
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

const DriverVehicle = ({ id, sub }) => {
    const { data, isLoading, error, refetch } = useFetch(`/v1/drivers/${id}/vehicles`)// Call useFetch custom hook
    const [open, setOpen] = useState({// Drawer state manager
        drawer: {
            open: false,
            id: null,
        },
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
                    <VehicleList vehicle={item} setOpen={setOpen} open={open} refetch={refetch} sub={sub} />
                )}
            />
            <Button onClick={() => setOpen({...open, modal: true})} >Add New Vehicle</Button>
            <Formik
                initialValues={initialValues}
                validationSchema={vehicleSchema}
                onSubmit={ async (values, { setSubmitting }) => {
                    const payload = { // Sets values to specified contraints
                        'user_id': Number(values.user_id),
                        'plate_number': values.plate_number,
                        'year': Number(values.year),
                        'color': values.color,
                        'model_id': Number(values.model_id),
                        'make_id': Number(values.make_id)
                    }
                    await createVehicle(payload).then((response) => {
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
                            open={open.modal} 
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