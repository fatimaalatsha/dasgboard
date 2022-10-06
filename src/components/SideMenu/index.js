import { useState, useEffect } from 'react'
import { Menu, Avatar, Space, Dropdown, Typography } from 'antd' // import antd components
import { useParams, useNavigate } from 'react-router-dom';
import {
  FileOutlined,
  CarOutlined,
  SettingOutlined,
  ProjectOutlined,
  DownOutlined,
  UserOutlined
} from '@ant-design/icons'; // import antd navigation icons

import { Auth } from 'aws-amplify' // import aws-amplify auth module

const { Text, Title } = Typography // destructure antd typography component

const SideMenu = ({collapsed}) => {
  const [user, setUser] = useState({ // set user state
    attributes: {},
    isLoading: true,
    error: false
  })

  const navigate = useNavigate();
  const params = useParams();

  const getUserInfo = async () => { // get user info
    try {
      const user = await Auth.currentUserInfo()
      setUser({ // set user state
        attributes: {
          firstName: user.attributes['custom:first_name'],
          lastName: user.attributes['custom:last_name'],
          email: user.attributes.email,
        },
        isLoading: false,
        error: false
      })
    } catch (error) {
      setUser({ // set user state
        username: {},
        isLoading: false,
        error: true
      })
    }
  }

  useEffect(() => { // get user info on component mount
    let isMounted = true
      if (isMounted) {
        getUserInfo()
      }
    return () => { isMounted = false }
  }, [])

  const menuItems = [
    {
      key: "/",
      label: 'Drivers',
      icon: <CarOutlined />,
    },
    {
      key: "/documents",
      label: 'Documents',
      icon: <FileOutlined />,
    },
    {
      key: "/reports",
      label: 'Reports',
      icon: <ProjectOutlined />,
    },
    {
      key: "/settings",
      label: 'Settings',
      icon: <SettingOutlined />,
    }
  ];
  
  const userMenu = (
    <Menu
      items={[
        {
          key: '1',
          label: (
            <Text type='secondary'>
              Profile
            </Text>
          ),
          disabled: true,
        },
        {
          key: '2',
          label: (
            <Text onClick={() => Auth.signOut()}>
              Sign Out
            </Text>
          )
        },
      ]}
    />
  );

  return (
    <>
      <Space style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: 8}} >
        {
          user.isLoading ? (
            <Title level={5} style={{ color: '#ffffff '}}>Loading...</Title>
          ) : (
              <Dropdown overlay={userMenu} placement="bottom" arrow>
                <Space direction='vertical' style={{ color: '#ffffff', display: 'flex', alignItems: 'center' }}>
                  <Avatar size={40} style={{ backgroundColor: '#1890ff' }} icon={<UserOutlined />} />
                  {
                    !collapsed && (
                      <Space>
                        <Title level={5} style={{ color: '#ffffff '}}>{user.attributes.firstName}</Title>
                        <DownOutlined />
                      </Space>
                    )
                  }
                </Space>
              </Dropdown>
          )
        }
      </Space>
      <Menu 
        theme="dark"
        mode="inline"
        defaultSelectedKeys={[`/${params['*']}`]}
        items={menuItems} 
        style={{borderTop: '1px solid black'}}
        onClick={(menuItem) => navigate(menuItem.key)}
      />
    </>
  )
};

export default SideMenu;