import { useState } from 'react'
import { Tooltip, Typography, Modal, Button, Space, Select, Divider } from 'antd' // Import antd components
import { EditOutlined } from '@ant-design/icons' // Import antd icons

const { Text } = Typography // Destructure Text from Typography
const { Option } = Select // Destructure Option from Select
const { confirm } = Modal // Destructure config from Modal

const EditableSelect = (props) => {
    const [isEnable, setIsEnable] = useState(false)// Set state for showing select input
    const [newValue, setNewValue] = useState('')// Set state for new value
    
    const handleChange = (value) => {// Create a new handleChange function
        setNewValue(value.key)
        //setIsEnable(false)// Set isEnable to false
    }

    const showConfirm = (value) => {
        confirm({
            title: 'Are you sure you want to edit this record?',
            content: 'This action cannot be undone.',
            onOk: async () => {
                /* await props.updateCallback({[props.name]: value})
                .then(() => {
                    setEditableString(value)
                }) */
                console.log(value)
            },
            onCancel() {
                console.log('Cancel');
            },
        });
    }

    return (
        <Space align="start" direction="horizontal">
            {
                isEnable ? (
                    <Select 
                        labelInValue
                        defaultValue={props.value} 
                        autoFocus={isEnable} 
                        open={isEnable} 
                        size='small' 
                        bordered={false} 
                        /* onChange={(value) => props.updateCallback({[props.name]: value})} */
                        onChange={handleChange}
                        style={{minWidth: 200}}
                        dropdownRender={menu => (
                            <Space direction="vertical" style={{ width: '100%'}}>
                                {menu}
                                <Divider style={{ margin: '2px 0'}} />
                                <Space direction='horizontal' style={{ display: 'flex', justifyContent: 'space-between', margin: 8}}>
                                    <Button type='default' size='small' onClick={() => setIsEnable(false)}>Cancel</Button>
                                    <Button type='primary' size='small' onClick={() => showConfirm(newValue)}>Save</Button>
                                </Space>
                            </Space>
                        )}
                    >
                        {
                            props.options.map((item, index) => (
                                <Option key={index} value={item.city_id}>{item.name}</Option>
                            ))
                        }
                    </Select>
                ) : (
                    <Text>{props.value}</Text>
                )
            }
            <Tooltip title="Edit">
                <Button style={{padding: 0, height: 'auto' }} onClick={() => setIsEnable(true)} type='link' icon={<EditOutlined />} />
            </Tooltip>
        </Space>
    )
}

export default EditableSelect