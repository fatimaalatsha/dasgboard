import { forwardRef } from 'react'
import { Select } from 'antd'
import useFetch from '../../hooks/use-fetch'
import useNewFetch from '../../hooks/use-new-fetch'

const CitySelect = forwardRef((props, ref) => {
    const { data, error, isLoading } = useNewFetch('/v1/cities?paginated=false&filter[status]=in|active')

    const cities = data?.data?.map((city) => {
        city.label = city.name
        city.value = city.id
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