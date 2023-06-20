/* Driver Select Dropdown 
* This component is a standalone select dropdown that is used to select a driver.
* It leaves onChange and value up to the parent component.
*/
import { forwardRef } from 'react'
import { Select, Tag, Space, Switch } from 'antd'
import useFetch from '../../hooks/use-new-fetch'
import { useFilterStore } from '../../store'

const Tags = (props) => {
    const { label, value, closable, onClose } = props

    const onPreventMouseDown = (event) => {
      event.preventDefault();
      event.stopPropagation();
    }

    const tagConfig = {
        closable,
        onClose,
        style: { marginRight: 4 },
        onPreventMouseDown:{onPreventMouseDown}
    }

    return (
        <Tag {...tagConfig}>
            <Space>
            {label}
            <Switch size="small" style={{ marginRight: 8 }} defaultChecked />
            </Space>
        </Tag>
    )
}

const DriverSelect = forwardRef((props, ref) => {
    const scheduleFilter = useFilterStore(state => state.scheduleFilter)
    const city = Number(scheduleFilter.filter.city_id.replace('in|', ''))
    const { data, error, isLoading } = useFetch('/v1/drivers?paginated=false&filter[status]=in|active&filter[city_id]=in|' + city) // Fetches active drivers in selected city
    
    const drivers = data?.data?.map((driver) => ({ // transforms data into format for select dropdown
        label: `${driver.first_name} ${driver.last_name}`,
        value: driver.user_id
    }))

    const selectConfig = {
        placeholder: "Driver",
        mode: "multiple",
        style: { width: '100%' },
        optionFilterProp: "children",
        options: drivers,
        tagRender: Tags,
        ref,
        ...props
    }

    isLoading && <>Loading...</>

    error && <>Something went wrong!</>

    return (
        <Select {...selectConfig} />
    )

})

export default DriverSelect