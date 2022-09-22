import { Select, Typography } from "antd" // Import antd components
import { useField, useFormikContext, ErrorMessage } from "formik" // Import Formik form hooks

const { Option } = Select // Destructure Option from Select
const { Text } = Typography // Destructure Text from Typography

const SelectWrapper = ({
    name,
    ...otherProps
}) => {
    const { setFieldValue } = useFormikContext() // Destructure setFieldValue from useFormikContext
    const [field, meta] = useField(name) // Destructure field and meta from useField

    const handleChange = (value) => {
        setFieldValue(name, value)
    }

    const selectConfig = {
        ...field,
        ...otherProps,
        style: {
            width: '100%',
        },
        onChange: handleChange,
        value: field.value || undefined,
        ...(otherProps.searchable && { 
            showSearch: true,
            optionFilterProp: "children",
            filterOption: (input, option) => option.children.toLowerCase().includes(input.toLowerCase())
        }),
    }

    if (meta && meta.touched && meta.error) {
        selectConfig.status = "error"
    }

    return (
        <>
        <Select {...selectConfig}>
            {otherProps.datasource.map((item, index) => (
                <Option key={index} value={item.value || item.make_id || item.model_id}>{item.text || item.name}</Option>
            ))}
        </Select>
        <ErrorMessage name={name}>
            {msg => <Text type="danger">{msg}</Text>}
        </ErrorMessage>
        </>
    )
}

export default SelectWrapper