
import { 
    Button,
    Space,
    Divider,
    Descriptions,
    Input,
    Form,
     message,
} from 'antd'

import { updateEmailTemplate } from '../../../utils/city-status'

const { Item } = Descriptions // destructuring Descriptions component
const { Search, TextArea } = Input // destructuring Input component

const WelcomeEmail = ({data, id, refetch}) => {

    const driverLicense = Object.assign({}, data?.items?.filter(item => item.key.includes('driver_licence_'))) // Find driver licence info
    const driverAbstract = Object.assign({}, data?.items?.filter(item => item.key.includes('driver_abstract_'))) // Find driver abstract info
    const vehicleOwnership = Object.assign({}, data?.items?.filter(item => item.key.includes('vehicle_ownership_'))) // Find vehicle ownership info
    const vehicleInsurance = Object.assign({}, data?.items?.filter(item => item.key.includes('vehicle_insurance_'))) // Find vehicle insurance info
    const workEligibility = Object.assign({}, data?.items?.filter(item => item.key.includes('work_eligibility_'))) // Find work eligibility info

    

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
        }]
    }

    const formButtonConfig = {
        type: 'primary',
        htmlType: 'submit',
    }

    return (
        <>
        <Space direction="vertical" style={{ width: '100%', padding: '16px 0'}}>
            <Divider orientation="left">Driver Licence</Divider>
            <Form 
                {...formConfig}
                initialValues={{
                    key: driverLicense[1]?.key,
                    value: driverLicense[1]?.value,
                }}
            >
                <Form.Item name="key" hidden><Input /></Form.Item>
                <Form.Item 
                    label="Requirement Name"
                    {...formItemConfig}
                >
                    <Input />
                </Form.Item>
                <Form.Item>
                    <Button {...formButtonConfig}>Update</Button>
                </Form.Item>
            </Form>
            <Search
                addonBefore="Name"
                placeholder="Requirement Name"
                value={driverLicense[1]?.value}
                enterButton="Update"
                size="middle"
            />
            <Search
                addonBefore="Class"
                placeholder="Requirement Name"
                value={driverLicense[0]?.value}
                enterButton="Update"
                size="middle"
            />
        </Space>
        <Space direction="vertical" style={{ width: '100%', padding: '16px 0'}}>
            <Divider orientation="left">Driver Abstract</Divider>
            <Search
                addonBefore="Name"
                placeholder="Requirement Name"
                value={driverAbstract[2]?.value}
                enterButton="Update"
                size="middle"
            />
            <Search
                addonBefore="Document Name"
                placeholder="Document Name"
                value={driverAbstract[0]?.value}
                enterButton="Update"
                size="middle"
            />
            <Search
                addonBefore="Place"
                placeholder="Place"
                value={driverAbstract[4]?.value}
                enterButton="Update"
                size="middle"
            />
            <Search
                addonBefore="URL"
                placeholder="URL to get the document"
                value={driverAbstract[1]?.value}
                enterButton="Update"
                size="middle"
            />
            <Search
                addonBefore="URL Name"
                placeholder="Name displayed on the URL"
                value={driverAbstract[3]?.value}
                enterButton="Update"
                size="middle"
            />
        </Space>
        <Space direction="vertical" style={{ width: '100%', padding: '16px 0'}}>
            <Divider orientation="left">Vehicle Ownership</Divider>
            <Search
                addonBefore="Name"
                placeholder="Requirement Name"
                value={vehicleOwnership[0]?.value}
                enterButton="Update"
                size="middle"
            />
            <Descriptions bordered size="small" labelStyle={{ width: '100px'}} column={1}>
                <Item label="Content" contentStyle={{ margin: 16}}>
                    <TextArea
                        style={{ width: '100%', marginBottom: 16}}
                        placeholder="Requirement Content"
                        value={vehicleOwnership[2]?.value}
                        size="large"
                        autoSize={{ minRows: 2, maxRows: 3 }}
                    />
                    <Button type="primary">Update</Button>
                </Item>
                <Item label="Notes" contentStyle={{ margin: 16}}>
                    <TextArea
                        style={{ width: '100%', marginBottom: 16}}
                        placeholder="Requirement Content"
                        value={vehicleOwnership[1]?.value}
                        size="large"
                        autoSize={{ minRows: 2, maxRows: 3 }}
                    />
                    <Button type="primary">Update</Button>
                </Item>
            </Descriptions>
        </Space>
        <Space direction="vertical" style={{ width: '100%', padding: '16px 0'}}>
            <Divider orientation="left">Vehicle Insurance</Divider>
            <Search
                addonBefore="Name"
                placeholder="Requirement Name"
                value={vehicleInsurance[1]?.value}
                enterButton="Update"
                size="middle"
            />
            <Descriptions bordered size="small" labelStyle={{ width: '100px'}} column={1}>
                <Item label="Content" contentStyle={{ margin: 16}}>
                    <TextArea
                        style={{ width: '100%', marginBottom: 16}}
                        placeholder="Requirement Content"
                        value={vehicleInsurance[0]?.value}
                        size="large"
                        autoSize={{ minRows: 2, maxRows: 3 }}
                    />
                    <Button type="primary">Update</Button>
                </Item>
            </Descriptions>
        </Space>
        <Space direction="vertical" style={{ width: '100%', padding: '16px 0'}}>
            <Divider orientation="left">Work Eligibility</Divider>
            <Search
                addonBefore="Name"
                placeholder="Requirement Name"
                value={workEligibility[0]?.value}
                enterButton="Update"
                size="middle"
            />
            <Descriptions bordered size="small" labelStyle={{ width: '100px'}} column={1}>
                <Item label="Content" contentStyle={{ margin: 16}}>
                    <TextArea
                        style={{ width: '100%', marginBottom: 16}}
                        placeholder="Requirement Content"
                        value={workEligibility[1]?.value}
                        size="large"
                        autoSize={{ minRows: 2, maxRows: 3 }}
                    />
                    <Button type="primary">Update</Button>
                </Item>
            </Descriptions>
        </Space>
        </>
    )
}

export default WelcomeEmail