import { createContext, useState, useEffect } from 'react'
import { Auth, Hub } from 'aws-amplify'
import { CognitoHostedUIIdentityProvider } from "@aws-amplify/auth"
import { useNavigate } from 'react-router-dom'

export const AuthContext = createContext(null)

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        const unsubscribe = Hub.listen('auth', ({ payload: { event, data }}) => {
            switch(event) {
                case 'signIn':
                    setUser(data)
                    navigate('/')
                    break
                case 'signOut':
                    setUser(null)
                    navigate('/login')
                    break
            }
        })

        Auth.currentSession()
        .then(currentUser => {
            setUser(currentUser)
        })
        .catch((error) => {
            Auth.signOut()
            console.log("Not signed in")
        })

        return unsubscribe
        
    }, [navigate])

    const signIn = () => {
        return Auth.federatedSignIn({ provider: CognitoHostedUIIdentityProvider.Google })
    }

    const value = {
        user,
        signIn
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthProvider