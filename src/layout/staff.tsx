import { useState } from 'react';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { TbLayoutDashboardFilled } from "react-icons/tb";
import { MdOutlineInventory,MdPointOfSale } from "react-icons/md";
import { GrMoney } from "react-icons/gr";
import { Avatar, Button, Layout, Menu, Popover, theme } from 'antd';
import { Outlet, useNavigate } from 'react-router-dom';
import { RouterUrl } from '../routes';
import { logoutAdmin } from '../zustand/store/store.provider';

const { Header, Sider, Content } = Layout;

export default function StaffSide() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const handleMenuClick = (key: string) => {
    navigate(key);
  };

  const handleLogout = () => {
    // Implement your logout logic here
    console.log('Logging out...');
    logoutAdmin()
    navigate(RouterUrl.Login)
  };

  const popoverContent = (
    <Menu
    style={{width:'100px'}}
      onClick={({ key }) => {
        if (key === 'logout') {
          handleLogout();
        } else if (key === 'settings') {
          navigate('/settings');
        }
      }}
      items={[
        { key: 'settings', label: 'Settings' },
        { key: 'logout', label: 'Logout' },
      ]}
    />
  );

  return (
    <Layout className="h-max min-h-screen">
      <Sider
        width={'20%'}
        style={{ background: '#0284c7' }}
        className='custom-menu'
        trigger={null}
        collapsible
        collapsed={collapsed}
      >
        <div className='p-4'>
          <p className='font-grand-hotel text-4xl text-white'>D’ Sweet Fix</p>
          <p className='text-white text-lg'>BAKING & CONFECTIONERY SHOP</p>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['1']}
          style={{ background: '#0284c7', color: 'white' }}
          onClick={({ key }) => handleMenuClick(key)}
          items={[
            {
              key: RouterUrl.StaffDashboard,
              icon: <TbLayoutDashboardFilled />,
              label: 'Dashboard',
            },
            {
              key: '2',
              label: 'Features',
              style: { background: '#0284c7' },
              children: [
                {
                  key: RouterUrl.POS,
                  label: 'Point of Sale',
                  icon: <MdPointOfSale />,
                },
                {
                  key: RouterUrl.ProductList,
                  label: 'Inventory',
                  icon: <MdOutlineInventory />,
                },
                {
                  key: RouterUrl.Sales,
                  label: 'Sales',
                  icon: <GrMoney />,
                },
              ],
            },
          ]}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: 0,
            background: colorBgContainer,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingRight: '12px'
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
            }}
          />
          <Popover
            content={popoverContent}
            trigger="click"
            placement="bottomRight"
          >
            <Avatar style={{ cursor: 'pointer' }} />
          </Popover>
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
