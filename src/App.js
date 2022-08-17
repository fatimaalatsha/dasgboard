import { Layout } from 'antd'
import AppRouter from './router/AppRouter'
import SideMenu from "./components/SideMenu";
import logo from './assets/data/uride_logo.svg';
import React, { useState } from 'react';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';

const { Sider, Content, Footer, Header} = Layout

function App() {
  const [collapsed, setCollapsed] = useState(false);
  
  return (
    <Layout id="components-layout-demo-custom-trigger" style={{minHeight:'100vh', height: '100%'}}>
      <Sider width={250} trigger={null} collapsible collapsed={collapsed} >
        <div className="logo" />
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
    </Layout>
    
  );
}

export default App;
