import { Select } from "antd" // Import antd components
import { useField, useFormikContext } from "formik" // Import Formik form hooks

const { Option } = Select // Destructure Option from Select

const SelectWarpper = ({
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
        placeholder: 'Select a reason to reject the document',
        style: {
            width: '100%',
        },
        onChange: handleChange,
        value: field.value || undefined,
    }

    if (meta && meta.touched && meta.error) {
        selectConfig.status = "error"
    }

    return (
        <Select {...selectConfig}>
            <Option value="wrong document">Wrong document</Option>
            <Option value="image is to blurry">Image is to blurry</Option>
            <Option value="expired document">Expired document</Option>
        </Select>
    )
}

export default SelectWarpper