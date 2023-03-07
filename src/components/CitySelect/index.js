import { Select } from 'antd';
import useFetch from '../../hooks/use-fetch';

const CitySelect = () => {
    const { data, error, isLoading } = useFetch('/v1/cities')

    const cities = data?.items?.map((city) => {
        city.value = city.city_id
        city.label = city.name
        return city 
    })

    isLoading && <>Loading...</>

    error && <>Something went wrong!</>
    
    return ( 
        <Select
            placeholder="City"
            optionFilterProp="children"
            style={{ width: 150 }}
            options={cities}
        />
    )
}

export { CitySelect }