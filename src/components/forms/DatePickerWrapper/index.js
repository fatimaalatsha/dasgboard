import { forwardRef } from 'react'
import { DatePicker, Typography, Space } from 'antd' // Import antd components
import { useField, useFormikContext, ErrorMessage } from 'formik' // Import Formik form components

const { Text } = Typography // Destructure Text from Typography

const DatePickerWrapper = forwardRef((props, ref) => {
    const { setFieldValue } = useFormikContext() // Destructure setFieldValue from useFormikContext
    const [field, meta] = useField(props) // Use Formik useField hook

    const pickerConfig = { // Config input
        ...field,
        ...props,
        onSelect: (value) => setFieldValue(props.name, value),
        onChange: (value) => setFieldValue(props.name, value), 
        placeholder: `Select ${props.name.replace('_', ' ')}`,
    }

    if (meta && meta.touched && meta.error) { // Display error status if field doesn't meet requirements
        pickerConfig.status = "error"
    }

    return (
        <Space direction="vertical" style={{ width: '100%' }}>
            <Text strong style={{ textTransform: 'capitalize'}}>{props.name.replace('_', ' ')}</Text>
            <DatePicker {...pickerConfig} />
            <ErrorMessage name={props.name}>
                {msg => <Text type="danger">{msg}</Text>}
            </ErrorMessage>
        </Space>
    )
})

export default DatePickerWrapper