import { useState } from 'react'
import { Typography, Modal } from 'antd' // Import antd components

const { Text } = Typography // Destructure Text from Typography
const { confirm } = Modal // Destructure config from Modal 

const EditableText = ({...props}) => {
    const [editableString, setEditableString] = useState(props.value)// Set editable string state
    const [isEditing, setIsEditing] = useState(true)// Set isEditing state

    const showConfirm = (value) => {
        confirm({
            title: 'Are you sure you want to edit this record?',
            content: 'This action cannot be undone.',
            onOk: async () => {
                await props.updateCallback({[props.name]: isNaN(value) ? value : String(value)})// Call updateCallback function
                .then(() => {
                    setEditableString(value)
                })
            },
            onCancel() {
                console.log('Cancel');
            },
        });
    }

    const textConfig = {// Set text config
        editable: { 
            onChange: async (value) => {// Set onChange function to update string value
                showConfirm(value) // Call confirm modal
            },
            ...(!isEditing && {editing: isEditing}), // Set editing state
        },
    }

    return (
        <>
            <Text {...textConfig}>{`${editableString}`}</Text>
        </>
    )
}

export default EditableText