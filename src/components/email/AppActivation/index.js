
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

const AppActivation = ({data, id, refetch}) => {

    const appActivationNumber = Object.assign({}, data?.items?.filter(item => item.key.includes('app_activation_'))) // Find app activation info

    const appActivation = [
        appActivationNumber
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
            appActivation.map((item, index) => {
                let dividerName = item[0].key?.replace(/\_([^_]+)$/, '')
                return (
                    <Space key={index} direction="vertical" style={{ width: '100%', padding: '16px 0'}}>
                        <Divider {...dividerConfig}>{dividerName.replace(/_/g, ' ')}</Divider>
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
                                            value.value?.length > 30 ? (
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

export default AppActivation