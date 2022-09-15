import { Layout } from 'antd'
import React, { useState } from 'react';
import { withAuthenticator, Button } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import AppRouter from './router/AppRouter'
import SideMenu from "./components/SideMenu";
import logo from './assets/data/uride_logo.svg';

const { Sider, Content, Header} = Layout

function App({ signOut, user }) {
  const [collapsed, setCollapsed] = useState(false);
  
  return (
    <Layout id="components-layout-demo-custom-trigger" style={{minHeight:'100vh', height: '100%'}}>
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
    </Layout>
  );
}

export default withAuthenticator(App);
