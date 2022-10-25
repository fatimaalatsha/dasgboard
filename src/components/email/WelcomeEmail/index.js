
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

const WelcomeEmail = ({data, id, refetch}) => {

    const driverLicense = Object.assign({}, data?.items?.filter(item => item.key.includes('driver_licence_'))) // Find driver licence info
    const driverAbstract = Object.assign({}, data?.items?.filter(item => item.key.includes('driver_abstract_'))) // Find driver abstract info
    const vehicleOwnership = Object.assign({}, data?.items?.filter(item => item.key.includes('vehicle_ownership_'))) // Find vehicle ownership info
    const vehicleInsurance = Object.assign({}, data?.items?.filter(item => item.key.includes('vehicle_insurance_'))) // Find vehicle insurance info
    const workEligibility = Object.assign({}, data?.items?.filter(item => item.key.includes('work_eligibility_'))) // Find work eligibility info

    const welcomeEmail = [
        driverLicense,
        driverAbstract,
        vehicleOwnership,
        vehicleInsurance,
        workEligibility
    ]

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
        name: 'value',
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
            welcomeEmail.map((item, index) => {
                let dividerName = item[0].key?.split('_') // Remove last underscore and everything after it
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
                                        value: value.value,
                                    }}
                                >
                                    <Form.Item name="key" hidden><Input /></Form.Item>
                                    <Form.Item 
                                        label={value.key.replace(/_/g, ' ')}
                                        {...formItemConfig}
                                    >
                                        {
                                            value.value.length > 30 ? (
                                                <TextArea rows={3} />
                                            ) : (
                                                <Input />
                                            )
                                        }
                                    </Form.Item>
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

export default WelcomeEmail