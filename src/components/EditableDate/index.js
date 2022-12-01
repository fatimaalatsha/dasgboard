import { useState } from 'react'
import { DatePicker, Button, Typography, Tooltip, Space, Modal } from 'antd' // Import antd components
import { EditOutlined } from '@ant-design/icons' // Import antd icons
import dayjs from "dayjs"// Import date handlers

const { Text } = Typography // Destructure Text from Typography
const { confirm } = Modal // Destructure config from Modal 

const EditableDate = ({...props}) => {
    const [dateValue, setDateValue] = useState(props.value)// Set date value state
    const [userDate, setUserDate] = useState('')// Set user date state
    const [isEnable, setIsEnable] = useState(false)// Set isEnable state
    const [isLoading, setIsLoading] = useState(false)// Set isLoading state
    const dateFormat = 'YYYY-MM-DD'// Set date format

    const showConfirm = (value) => {
        setIsEnable(false)// Set isEnable state to false
        confirm({
            title: 'Are you sure you want to edit this record?',
            content: 'This action cannot be undone.',
            onOk: async () => {
                await props.updateCallback({[props.name]: value})
                .then(() => {
                    setDateValue(userDate)
                    setIsLoading(false)
                    setIsEnable(false)
                })
            },
            onCancel() {
                console.log('Cancel')
                setIsLoading(false)
                setIsEnable(false)
            },
        });
    }

    return (
        <Space align="start" direction="horizontal">
        {
            isEnable ? (
                <DatePicker 
                    defaultValue={dayjs(dayjs(dateValue).format(dateFormat))} 
                    autoFocus={isEnable}
                    open={isEnable}
                    allowClear={false}
                    inputReadOnly={true}
                    size='small'
                    showToday={false}
                    format={dateFormat} 
                    bordered={false} 
                    onChange={(date, dateString) => {
                        setUserDate(dateString)
                    }}
                    renderExtraFooter={() => (
                        <Space direction='horizontal' style={{ display: 'flex', justifyContent: 'space-between'}}>
                            <Button type='default' size='small' onClick={() => setIsEnable(false)}>Cancel</Button>
                            <Button type='primary' size='small' loading={isLoading} onClick={ async () => showConfirm(userDate)}>Save</Button>
                        </Space>
                    )}
                />
            ) : (
                <Text>{dateValue}</Text>
            )
        }
        <Tooltip title="Edit">
            <Button style={{padding: 0, height: 'auto' }} onClick={() => setIsEnable(true)} type='link' icon={<EditOutlined />} />
        </Tooltip>
        </Space>
    )
}

export default EditableDate