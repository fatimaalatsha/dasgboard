import { forwardRef } from 'react'
import { Input, Typography } from 'antd' // Import antd components
import { useField, useFormikContext, ErrorMessage } from 'formik' // Import Formik form components

const { Text } = Typography // Destructure Text from Typography

const InputWrapper = forwardRef((props, ref) => {
    const { setFieldValue } = useFormikContext() // Destructure setFieldValue from useFormikContext
    const [field, meta] = useField(props) // Use Formik useField hook

    const handleChange = (event) => {
        const { value: userInput } = event.target
        const regEx = /^[0-9]*$/
        if (props.year) {
            regEx.test(userInput) && setFieldValue(props.name, userInput)
        } else {
            setFieldValue(props.name, userInput)
        }
    }

    const configInput = { // Config input
        ...field,
        ...props,
        ref,
        onChange: handleChange,
        ...(props.year && { maxLength: 4 }),
    }

    if (meta && meta.touched && meta.error) {
        configInput.status = "error"
    }

    return (
        <>
            <Input {...configInput} />
            <ErrorMessage name={props.name}>
                {msg => <Text type="danger">{msg}</Text>}
            </ErrorMessage>
        </>
    )
})

export default InputWrapper