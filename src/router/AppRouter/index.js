import Drivers from "../../pages/Drivers"
import { Routes, Route } from 'react-router-dom';
import DriverDetails from "../../pages/DriverDetails";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Drivers />} />
      <Route path="driver/:id" element={<DriverDetails />} />
    </Routes>
  )
};

export default AppRoutes;