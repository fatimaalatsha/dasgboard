import { useContext } from 'react'
import { Space, Button, Typography } from 'antd' // Importing antd components
import { GoogleOutlined } from '@ant-design/icons' // Importing antd icons
import { useNavigate } from 'react-router-dom' 

import { AuthContext } from '../../auth/AuthProvider'

const { Paragraph, Title } = Typography


const Login = () => {
    const navigate = useNavigate()
    const auth = useContext(AuthContext)

    return (
        <Space style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            rowGap: 16,
            backgroundColor: '#FAF9F9'
        }}>
            <Space direction='vertical' align='center'>
                <img src='https://uridetech.com/img/uride_footer.svg' alt='Uride' />
                <Title level={5} style={{ color: '#212529'}}>A new ride experience</Title>
            </Space>
            <Button onClick={auth.signIn} type='primary' icon={<GoogleOutlined />}>Sign in with Uride</Button>
            <Paragraph>By signing in, you agree to our <a href='https://uridetech.com/terms'>Terms of Service</a> and <a href='https://uridetech.com/privacy'>Privacy Policy</a></Paragraph>
        </Space>
    )
}

export default Login