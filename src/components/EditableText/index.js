import { useState } from 'react'
import { Typography, Modal } from 'antd' // Import antd components

const { Text, Title } = Typography // Destructure Text from Typography
const { confirm } = Modal // Destructure config from Modal 

const EditableText = ({...props}) => {
    const [editableString, setEditableString] = useState(props.value)// Set editable string state
    const [isEditing, setIsEditing] = useState(true)// Set isEditing state
    const valueType = typeof props.value // Get value type

    const showConfirm = (value) => {
        confirm({
            title: 'Are you sure you want to edit this record?',
            content: 'This action cannot be undone.',
            onOk: async () => {
                await props.updateCallback({[props.name]: valueType === 'number' ? Number(value) : String(value)})// Call updateCallback function
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
        ...(props.copyable && {copyable: true}), // Set copyable config
        ...(props.strong && {strong: true}), // Set strong config
    }

    return (
        <>
            { !props.heading ? 
                (<Text {...textConfig}>{`${editableString}`}</Text>)
                :
                (<Title level={4} type="secondary" style={{ margin: 0 }} {...textConfig} strong>{`${editableString}`}</Title>)
            }
        </>
    )
}

export default EditableText