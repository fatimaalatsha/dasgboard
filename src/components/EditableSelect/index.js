import { useState } from 'react'
import { Tooltip, Typography, Modal, Button, Space } from 'antd' // Import antd components
import { EditOutlined } from '@ant-design/icons' // Import antd icons

const { Text } = Typography // Destructure Text from Typography
const { confirm } = Modal // Destructure config from Modal

const EditableSelect = (props) => {
    return (
        <Space align="start" direction="horizontal">
        <Text>{props.value}</Text>
        <Tooltip title="Edit">
            <Button style={{padding: 0, height: 'auto' }} /* onClick={() => setIsEnable(true)} */ type='link' icon={<EditOutlined />} />
        </Tooltip>
        </Space>
    )
}

export default EditableSelect