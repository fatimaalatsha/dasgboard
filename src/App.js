/* import { Layout } from 'antd' */
import React, { useState } from 'react';
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


    {/* <Layout id="components-layout-demo-custom-trigger" style={{minHeight:'100vh', height: '100%'}}>
      <Sider width={250} trigger={null} collapsible collapsed={collapsed} >
        <SideMenu />
      </Sider>
      <Layout className="site-layout">
        <Header className="site-layout-background" style={{ padding: 0 }}>
            {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
              className: 'trigger',
              onClick: () => setCollapsed(!collapsed),
            })}
        </Header>
        <Content >
          <AppRouter />
        </Content>
      </Layout>
    </Layout> */}
