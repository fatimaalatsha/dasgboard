import { useState } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Drivers from "../../pages/Drivers"
import DriverDetails from "../../pages/DriverDetails"

const AppRoutes = ({children}) => {
  const [isUser, setIsUser] = useState(false)
  const location = useLocation()

  const isUserLoggenIn = () => {
    try {

    } catch (error) {
      console.log(error)
    }
  }

  return (
    <>
    {
      isUser ? children
      : <Navigate to="/login" state={{ from: location }} replace />
    }
    </>
  )
};

export default AppRoutes;

{/* <Routes>
      <Route path="/" element={<Drivers />} />
      <Route path="driver/:id" element={<DriverDetails />} />
    </Routes> */}