
import { 
    Button,
    Space,
    Divider,
    Input,
    Form,
    message,
} from 'antd'

import { updateEmailTemplate } from '../../../utils/city-status'

const { TextArea } = Input // destructuring Input component

const InitialDocuments = ({data, id, refetch}) => {

    const vehicleSafety = Object.assign({}, data?.items?.filter(item => item.key.includes('vehicle_safety_'))) // Find vehicle safety info
    const backgroundCheck = Object.assign({}, data?.items?.filter(item => item.key.includes('background_check_'))) // Find background check info
    const insuranceVerification = Object.assign({}, data?.items?.filter(item => item.key.includes('insurance_verification_'))) // Find insurance verification info
    const cityLicensing = Object.assign({}, data?.items?.filter(item => item.key.includes('city_licensing_'))) // Find city licensing info

    const initialDocuments = [
        vehicleSafety,
        backgroundCheck,
        cityLicensing,
    ]

    Number(id) === 8 && initialDocuments.push(insuranceVerification)

    const successAlert = (msg) => { // Success alert method
        message.success(msg)
    }

    const onFinish = async (values) => {
        await updateEmailTemplate(id, values)
        .then((response) => {
            successAlert(response)
            refetch()
        })
    }

    const formConfig = {
        onFinish: onFinish,
        layout: 'vertical',
    }

    const formItemConfig = {
        //name: 'value',
        rules: [{
            required: true,
            message: 'Required',
        }],
        style: {
            textTransform: 'capitalize'
        }
    }

    const formButtonConfig = {
        type: 'primary',
        htmlType: 'submit',
    }

    const dividerConfig = {
        orientation: 'left',
        style: {
            textTransform: 'capitalize'
        },
    }

    return (
        <>
        {
            initialDocuments.map((item, index) => {
                let dividerName = item[0].key?.split('_')
                return (
                    <Space key={index} direction="vertical" style={{ width: '100%', padding: '16px 0'}}>
                        <Divider {...dividerConfig}>{`${dividerName[0]} ${dividerName[1]}`}</Divider>
                        {
                            Object.entries(item).map(([key, value]) => ( 
                                <Form 
                                    key={value.key}
                                    {...formConfig}
                                    initialValues={{
                                        key: value.key,
                                        value: value.value
                                    }}
                                >
                                    <Form.Item name="key" hidden><Input /></Form.Item>
                                    {
                                        value.type === 'array' ? (
                                            <Form.List name="value">
                                            {
                                                fields => (
                                                    <>
                                                    {
                                                        fields.map(field => (
                                                            <Form.Item {...formItemConfig} {...field}>
                                                                <TextArea rows={3}/>
                                                            </Form.Item>
                                                        ))

                                                    }
                                                    </>
                                                )
                                            }
                                            </Form.List>
                                        ) : (
                                        <Form.Item 
                                            name="value"
                                            label={value.key.replace(/_/g, ' ')}
                                            {...formItemConfig}
                                        >
                                            {
                                                value.value?.length > 40 ? (
                                                    <TextArea rows={3} />
                                                ) : (
                                                    <Input />
                                                )
                                            }
                                        </Form.Item>
                                        )
                                    }
                                    <Form.Item>
                                        <Button {...formButtonConfig}>Update</Button>
                                    </Form.Item>
                                </Form>
                                ))
                        }
                    </Space>
                )
            })
        }
        </>
    )
}

export default InitialDocuments