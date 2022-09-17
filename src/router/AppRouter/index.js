import { useState, useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'

import { Auth } from 'aws-amplify' // Import auth method from aws-amplify

const AppRoutes = ({children}) => {
  const [isUser, setIsUser] = useState({
    loading: true,
    user: null
  })
  const location = useLocation()

  const isUserLoggenIn = async () => {
    await Auth.currentSession()
      .then(() => {
        setIsUser({
          loading: false,
          user: true
        })
      })
      .catch(() => {
        setIsUser({
          loading: false,
          user: false
        })
        console.log('Not Signed In')
      })
  }

  useEffect(() => {
    // clean up controller
    let isSubscribed = true
    if (isSubscribed) {
      isUserLoggenIn()
    }
    return () => (isSubscribed = false)
  }, [])

  if (isUser.loading) {
    return <div>Loading...</div>
  }

  return (
    <>
    {
      isUser.user ? children
      : <Navigate to="/login" state={{ from: location }} replace />
    }
    </>
  )
};

export default AppRoutes