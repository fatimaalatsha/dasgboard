import { Menu } from 'antd'
import { useNavigate } from 'react-router-dom';
import {
  FileOutlined,
  CarOutlined,
  SettingOutlined,
  ProjectOutlined,
} from '@ant-design/icons';

const SideMenu = () => {
  const navigate = useNavigate();

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

  return (
    <Menu 
    theme="dark"
    mode="inline"
    defaultSelectedKeys={['/']}
    items={menuItems} 
    style={{borderTop: '1px solid black'}}
    onClick={(menuItem) => navigate(menuItem.key)}
    />
  )
};

export default SideMenu;