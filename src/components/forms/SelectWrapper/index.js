import { Select } from "antd" // Import antd components

const { Option } = Select // Destructure Option from Select

const SelectWarpper = () => {

    const selectConfig = {
        placeholder: 'Select a reason to reject the document',
        style: {
            width: '100%',
        }
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