import { forwardRef } from 'react'
import { Select } from 'antd'
import useFetch from '../../hooks/use-fetch'

const CitySelect = forwardRef((props, ref) => {
    const { data, error, isLoading } = useFetch('/v1/cities')

    const cities = data?.items?.map((city) => {
        city.value = city.city_id
        city.label = city.name
        return city 
    })

    const selectConfig = {
        placeholder: "City",
        optionFilterProp: "children",
        style: { width: 150 },
        options: cities,
        ref,
        ...props
    }

    isLoading && <>Loading...</>

    error && <>Something went wrong!</>
    
    return ( 
        <Select {...selectConfig} />
    )
})

export { CitySelect }