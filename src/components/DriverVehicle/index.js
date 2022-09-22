
import { useState } from 'react'
import { 
    Descriptions,
    Tag,
    Space,
    Button,
    Empty,
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
import { createVehicle, deleteVehicle } from '../../utils/vehicle-status' // Import vehicle status functions

import SubmitWrapper from '../forms/SubmitWrapper' // Import SubmitWrapper component
import InputWrapper from '../forms/InputWrapper' // Import InputWrapper component
import SelectWrapper from '../forms/SelectWrapper' // Import SelectWrapper component

const rejectSchema = object().shape({
    plate_number: string().required('Required'),
    year: string().required('Required'),
    color: string().required('Required'),
    make_id: number().required('Required'),
    model_id: number().required('Required'),
    user_id: number().required('Required'),
})

const VehicleMakeFeeder = ({name}) => {
    const { data, isLoading, error } = useFetch(`/v1/makes`)// Call useFetch custom hook

    if (isLoading) {
        return <>Loading...</>
    }

    if (error) {
        return <>Something went wrong</>
    }
    
    return (
        <SelectWrapper name={name} datasource={data.items} placeholder="Vehicle Make" searchable="true" />
    )
}

const VehicleModelFeeder = ({name, make_id}) => {
    const { data, isLoading, error } = useFetch(`/v1/makes/${make_id}/models`)// Call useFetch custom hook

    if (isLoading) {
        return <>Loading...</>
    }

    if (error) {
        return <>Something went wrong</>
    }
    
    return (
        <SelectWrapper name={name} datasource={data.models} placeholder="Vehicle Model" searchable="true" />
    )
}

const { Text } = Typography // Destructure Title from Typography

const DriverVehicle = ({ id }) => {
    const { data, isLoading, error, refetch } = useFetch(`/v1/drivers/cc/${id}/vehicles`)// Call useFetch custom hook
    const [open, setOpen] = useState({// Drawer state manager
        drawer: false,
        modal: false,
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
    
    const showWarning = (id, make, model, plateNumber) => {
        Modal.confirm({
            title: 'Delete vehicle?',
            content: 
                <Space direction="vertical">
                <Text>
                    {`Are you sure you want to delete `} <Text mark strong>{`${make} ${model} ${plateNumber}`}</Text>{` ?`}
                </Text>
                <Text strong>
                    {`This action cannot be undone, driver's status will be set to offline.`}
                </Text>
                </Space>
                ,
            onOk: async () => {
                const response = await deleteVehicle(id)
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

    return (
        <Space direction='vertical' style={{ display: 'flex', width: '100%', alignItems: 'center'}}>
            <Empty description="No vehicles associated" />
            <List 
                dataSource={data.items} 
                renderItem={item => (
                    <>
                    <List.Item
                        actions={[
                            <Button type="primary" size="small" danger ghost onClick={() => showWarning(item.vehicleId, item.make?.name, item.model?.name, item.plate_number)}>Delete</Button>,
                            <Button disabled type="primary" size="small" onClick={() => setOpen({...open, drawer: true})}>View</Button>,
                            <Switch defaultChecked={item.status === 'active'} />
                        ]}
                    >
                        <Descriptions labelStyle={{ fontWeight:'bold' }} >
                            <Descriptions.Item label="Plate Number">{item.plate_number}</Descriptions.Item>
                            <Descriptions.Item label="Make">{item.make?.name}</Descriptions.Item>
                            <Descriptions.Item label="Model">{item.model?.name}</Descriptions.Item>
                            <Descriptions.Item label="Year">{item.year}</Descriptions.Item>
                            <Descriptions.Item label="Color">{item.color}</Descriptions.Item>
                            <Descriptions.Item label="Status">
                                <Tag 
                                    style={{ textTransform: 'capitalize'}} 
                                    color={item.status === 'active' ? 'green' : 'red'}
                                >
                                    {item.status}
                                </Tag>
                            </Descriptions.Item>
                        </Descriptions>
                    </List.Item>
                    <Drawer title="Basic Drawer" placement="right" onClose={() => setOpen({...open, drawer: false})} visible={open.drawer}>
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
                    </Drawer>
                    </>
                )}
            />
            <Button onClick={() => setOpen({...open, modal: true})} >Add New Vehicle</Button>
            <Formik
                initialValues={initialValues}
                validationSchema={rejectSchema}
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