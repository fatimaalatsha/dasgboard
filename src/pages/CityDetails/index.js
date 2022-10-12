import { 
    Card,
    Button,
    Typography,
    Space
 } from 'antd'
 import { ArrowLeftOutlined } from '@ant-design/icons'
import { useParams } from 'react-router-dom'

import useFetch from '../../hooks/use-fetch'

const { Title } = Typography // destructuring Typography component

const CityDetails = () => {
    const { id } = useParams()
    const { data, loading, error, refetch } = useFetch(`/v1/cities/${id}`)

    if (loading) {
        return <>Loading...</>
    }

    if (error) {
        return <>Error: {error.message}</>
    }
console.log(data)
    return (
        <Card
            title={
                <Space align="start">
                    <Button onClick={() => window.history.back()} type="text" icon={<ArrowLeftOutlined />} />
                    <Title>{data.name}</Title>
                </Space>
            }
        >
        </Card>
    )
}

export default CityDetails