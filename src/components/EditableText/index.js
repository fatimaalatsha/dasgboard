import { useState } from 'react'
import { Typography } from 'antd' // Import antd components
import { Auth } from 'aws-amplify'// Import Amplify auth method
import API from '../../api/BaseUrl' // Import API base URL

const { Text } = Typography // Destructure Text from Typography

const EditableText = (props) => {
    const [editableString, setEditableString] = useState(props)// Set editable string state
    const [isEditing, setIsEditing] = useState(true)// Set isEditing state

    const updateText = async (payload) => {
        try {
            console.log(payload)
            const auth = await Auth.currentSession()// Get current session
            const token = auth.getAccessToken().getJwtToken()// Get token from session
            const options = { // Set options for fetch
                headers: {
                    'Authorization': token,
                    ...(process.env.REACT_APP_ENV && {'env': process.env.REACT_APP_ENV}),
                }
            }
            const body = payload
            const response = await API.put(`/v1/drivers/cc/`, body, options)
            const data = await response.data
            if(data) {
                console.log(data)
            }
        } catch (error) {
            console.log(error)
        }
    }

    const textConfig = {// Set text config
        editable: { 
            onChange: async (value) => {// Set onChange function to update string value
                console.log({[`${Object.keys(editableString)}`]: value})
                setEditableString({[`${Object.keys(editableString)}`]: value})
                //Disabled for now until API is ready
                /* await updateText({[`${Object.keys(editableString)}`]: value})
                .then(() => {
                    setEditableString({[`${Object.keys(editableString)}`]: value})
                }) */
            },
            ...(!isEditing && {editing: isEditing}), // Set editing state
        },
    }

    return (
        <>
            <Text {...textConfig}>{editableString.text}</Text>
        </>
    )
}

export default EditableText