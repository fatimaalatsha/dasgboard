import AppRouter from './router/AppRouter'
import { Routes, Route } from 'react-router-dom'

import AuthProvider from './auth/AuthProvider'
import Login from './pages/Login'
import Layout from './outlet/Layout'

function App() {
  
  return (
    <AuthProvider>
      <Routes>
        <Route path='/login' element={<Login />}/>
        <Route path='/*' element={
          <AppRouter>
            <Layout />
          </AppRouter>
        }/>
      </Routes>
    </AuthProvider>
  )
}

export default App
