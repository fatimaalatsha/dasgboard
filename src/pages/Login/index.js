import { Space, Button } from 'antd'
import { GoogleOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { Auth } from 'aws-amplify'// Import Amplify auth method
import { CognitoHostedUIIdentityProvider } from "@aws-amplify/auth"

const Login = () => {
    const navigate = useNavigate()

    const signIn = async () => {
        await Auth.federatedSignIn({ provider: CognitoHostedUIIdentityProvider.Google })  // Sign in with Google
        .then(() => {
            console.log('Signed in')
            navigate('/') // Navigate to home page
        })
        .catch((error) => {
            console.log(error)
        })
    }

    return (
        <Space style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh'
        }}>
            <>Uride</>
            <Button onClick={() => signIn()} type='primary' icon={<GoogleOutlined />}>Sign in with Uride</Button>
        </Space>
    )
}

export default Login