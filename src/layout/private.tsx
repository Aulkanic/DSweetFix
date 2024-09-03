import { useState } from 'react';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined 
} from '@ant-design/icons';
import { BsList } from "react-icons/bs";
import { TiGroupOutline } from "react-icons/ti";
import { TbLayoutDashboardFilled, TbCategoryFilled, TbReportSearch } from "react-icons/tb";
import { MdOutlineAdd, MdOutlineInventory } from "react-icons/md";
import { GrMoney } from "react-icons/gr";
import { Avatar, Button, Layout, Menu, Popover, theme } from 'antd';
import { Outlet, useNavigate } from 'react-router-dom';
import { RouterUrl } from '../routes';
import { logoutAdmin } from '../zustand/store/store.provider';
import AdminProfileModal from './AdminProfile';

const { Header, Sider, Content } = Layout;

export default function Private() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false); 
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
      style={{ width: '100px' }}
      onClick={({ key }) => {
        if (key === 'logout') {
          handleLogout();
        } else if (key === 'settings') {
          setIsModalVisible(true); // Show the modal when "Settings" is clicked
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
              key: RouterUrl.AdminDashboard,
              icon: <TbLayoutDashboardFilled />,
              label: 'Dashboard',
            },
            {
              key: '2',
              label: 'Management',
              style: { background: '#0284c7' },
              children: [
                {
                  key: '9',
                  label: 'Staff',
                  icon: <TiGroupOutline />,
                  children: [
                    { key: RouterUrl.StaffList, label: 'Staff List', icon: <BsList /> },
                    { key: RouterUrl.StaffAdd, label: 'Create Staff', icon: <MdOutlineAdd /> },
                  ],
                },
                {
                  key: '10',
                  label: 'Inventory',
                  icon: <MdOutlineInventory />,
                  children: [
                    { key: RouterUrl.InventoryList, label: 'Inventory List', icon: <BsList /> },
                    { key: RouterUrl.InventoryCreation, label: 'Add Inventory Item', icon: <MdOutlineAdd /> },
                  ],
                },
                {
                  key: 'sub3',
                  label: 'Category',
                  icon: <TbCategoryFilled />,
                  children: [
                    { key: RouterUrl.CategoryList, label: 'Cateogry List', icon: <BsList /> },
                    { key: RouterUrl.CategoryCreation, label: 'Add Category', icon: <MdOutlineAdd /> },
                  ],
                },
              ],
            },
            {
              key: '3',
              label: 'Analytics',
              children: [
                { key: RouterUrl.AdminSales, label: 'Sales', icon: <GrMoney /> },
                { key: RouterUrl.Reports, label: 'Reports', icon: <TbReportSearch /> },
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
            <Avatar icon={<UserOutlined />} style={{ cursor: 'pointer',backgroundColor: '#87d068' }} />
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
      <AdminProfileModal visible={isModalVisible} onClose={() => setIsModalVisible(false)} />
    </Layout>
  );
}
