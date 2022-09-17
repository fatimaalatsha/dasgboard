import AppRouter from './router/AppRouter'
import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Layout from './outlet/Layout'

function App() {
  
  return (
    <Routes>
      <Route path='/login' element={<Login />}/>
      <Route path='/*' element={
        <AppRouter>
          <Layout />
        </AppRouter>
      }/>
    </Routes>
  )
}

export default App
