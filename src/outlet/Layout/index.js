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
                    <Route path="/driver/:id" element={<DriverDetails />} />
                    <Route path="/documents" element={<Documents />} />
                    <Route path="/cities" element={<Cities />} />
                    <Route path="/city/:id" element={<CityDetails />} />
                    <Route path="/trainings" element={<Trainings />} />
                </Routes>
            </Content>
          </Container>
        </Container>
    )
}

export default Layout