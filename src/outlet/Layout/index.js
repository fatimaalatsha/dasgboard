import React, { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Layout as Container } from 'antd'
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
  } from '@ant-design/icons'

import SideMenu from "../../components/SideMenu"

import Drivers from "../../pages/Drivers"
import DriverDetails from "../../pages/DriverDetails"
import Documents from '../../pages/Documents'
import Cities from "../../pages/Cities"
import CityDetails from "../../pages/CityDetails"
import Trainings from '../../pages/Trainings'
import TrainingDetails from '../../pages/TrainingDetails'
import Applicants from '../../pages/Applicants'
import Schedule from '../../pages/Schedule'
import Reports from '../../pages/Reports'
import ReportDetails from '../../pages/ReportDetails'
import NumberOfleads from '../../pages/NumberOfLeads' 

const { Sider, Content, Header} = Container // Destructuring Layout component

const Layout = () => {
    const [collapsed, setCollapsed] = useState(false)

    return (
        <Container id="components-layout-demo-custom-trigger" style={{minHeight:'100vh', height: '100%'}}>
          <Sider width={250} trigger={null} collapsible collapsed={collapsed} >
            <SideMenu collapsed={collapsed} />
          </Sider>
          <Container className="site-layout">
            <Header className="site-layout-background" style={{ padding: 0 }}>
                {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
                  className: 'trigger',
                  onClick: () => setCollapsed(!collapsed),
                })}
            </Header>
            <Content >
                <Routes>
                    <Route path="/*" index element={<Drivers />} />
                    <Route path="/documents" element={<Documents />} />
                    <Route path="/cities" element={<Cities />} />
                    <Route path="/city/:id" element={<CityDetails />} />
                    <Route path="/trainings" element={<Trainings />} />
                    <Route path="/training/:id" element={<TrainingDetails />} />
                    <Route path="/applicants" element={<Applicants />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/reports/:id" element={<ReportDetails />} />
                    <Route path="/schedule" element={<Schedule />} />
                    <Route path="/reports/conversion_rates" element={<NumberOfleads />} />
                    <Route path="/reports/conversion_rates_per_stage" element={<ReportDetails />} />
                    {['/documents/:id', '/drivers/:id', '/applicants/:id'].map(path => <Route key="Details" path={path} element={<DriverDetails />} />)}
                </Routes>
            </Content>
          </Container>
        </Container>
    )
}

export default Layout