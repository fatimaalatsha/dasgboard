import { useState } from 'react'
import { DatePicker, Button, Typography } from 'antd' // Import antd components
import { EditOutlined } from '@ant-design/icons' // Import antd icons
import dayjs from "dayjs"// Import date handlers

const EditableDate = ({...props}) => {
    const [dateValue, setDateValue] = useState(props.value)// Set date value state
    return (
        <>
        <DatePicker defaultValue={dayjs(dateValue)} onChange={() => console.log('yo')} />
        <Button type='link' icon={<EditOutlined />} />
        </>
    )
}

export default EditableDate