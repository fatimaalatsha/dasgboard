/* Driver Select Dropdown 
* This component is a standalone select dropdown that is used to select drivers in formik forms.
* It leaves onChange and value up to the parent component.
*/
import { forwardRef, useState, useEffect } from 'react'
import { Select, Tag, Space, Switch, Tooltip } from 'antd'
import { useFormikContext } from 'formik'

import useFetch from '../../hooks/use-new-fetch'
import { useFilterStore } from '../../store'

const DriverSelect = forwardRef((props, ref) => {
    const scheduleFilter = useFilterStore(state => state.scheduleFilter)
    const city = Number(scheduleFilter.filter.city_id.replace('in|', ''))
    const { data, error, isLoading } = useFetch('/v1/drivers?paginated=false&filter[status]=in|active&filter[city_id]=in|' + city) // Fetches active drivers in selected city
    const [drivers, setDrivers] = useState([])
    const { values, setFieldValue, initialValues } = useFormikContext()

    useEffect(() => {
        if (data) {
            setDrivers(data?.data?.map((driver) => ({ // transforms data into format for select dropdown
                label: `${driver.first_name} ${driver.last_name}`,
                value: driver.user_id,
                is_permanent: false,
            })))
        }
    }, [data])

    const defaultDrivers = initialValues.drivers.map((driver) => ({ // transforms data into format for select dropdown
        value: driver.user_id,
        is_permanent: driver.is_permanent,
    }))

    const Tags = (props) => {
        const { label, value, closable, onClose } = props

        const onPreventMouseDown = (event) => {
        event.preventDefault();
        event.stopPropagation();
        }

        const tagConfig = {
            closable,
            onClose,
            style: { margin: 4 },
            onMouseDown: onPreventMouseDown
        }

        const handleSwitchChange = (checked) => {
            const result = values.drivers.map((driver) => { // updates is_permanent value in formik values
                if (driver.driver_id === value) {
                    driver.is_permanent = checked
                }
                return driver
            })

            const updatedDrivers = drivers.map((driver) => { // updates is_permanent value in dropdown
                return driver.value === value ? { ...driver, is_permanent: checked } : driver
            })

            setFieldValue('drivers', result)
            setDrivers(updatedDrivers)
        }

        return (
            <Tag {...tagConfig}>
                <Space style={{ marginRight: 8 }}>
                {label}
                <Tooltip title="Permanent Driver?">
                    <Switch 
                        size="small" 
                        checked={values.drivers.find((driver) => driver.driver_id === value)?.is_permanent}
                        onChange={handleSwitchChange}
                    />
                </Tooltip>
                </Space>
            </Tag>
        )
    }

    const selectConfig = {
        placeholder: "Driver",
        mode: "multiple",
        style: { width: '100%' },
        options: drivers,
        tagRender: Tags,
        defaultValue: defaultDrivers,
        disabled: values.drivers.length >= values.capacity ,
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