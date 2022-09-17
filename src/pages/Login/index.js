import { useContext } from 'react'
import { Space, Button } from 'antd' // Importing antd components
import { GoogleOutlined } from '@ant-design/icons' // Importing antd icons
import { useNavigate } from 'react-router-dom' 

import { AuthContext } from '../../auth/AuthProvider'


const Login = () => {
    const navigate = useNavigate()
    const auth = useContext(AuthContext)

    return (
        <Space style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh'
        }}>
            <>Uride</>
            <Button onClick={auth.signIn} type='primary' icon={<GoogleOutlined />}>Sign in with Uride</Button>
        </Space>
    )
}

export default Login