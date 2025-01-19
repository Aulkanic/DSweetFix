/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import {
  BellOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import { BsList } from "react-icons/bs";
import { TiGroupOutline } from "react-icons/ti";
import {
  TbLayoutDashboardFilled,
  TbCategoryFilled,
  TbReportSearch,
} from "react-icons/tb";
import { MdOutlineAdd, MdOutlineInventory } from "react-icons/md";
import { GrMoney } from "react-icons/gr";
import {
  Avatar,
  Badge,
  Button,
  Dropdown,
  Layout,
  Menu,
  Popover,
  theme,
} from "antd";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { RouterUrl } from "../routes";
import { logoutAdmin, selector } from "../zustand/store/store.provider";
import AdminProfileModal from "./AdminProfile";
import useStore from "../zustand/store/store";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../db";
import { Category, Product } from "../types";
import styled from "styled-components";

const { Header, Sider, Content } = Layout;
const LOW_STOCK_THRESHOLD = 10;

const StyledSider = styled(Sider)`
  background: #b0e0e6 !important;
  color: black !important;
  .ant-menu {
    background: #b0e0e6 !important;
    color: black !important;
  }
  .ant-menu-item-selected {
    background-color: #87ceeb !important;
    color: black !important;
  }
  .ant-menu-title-content,
  .ant-menu-item-icon {
    color: black !important;
    font-size: 16px !important;
  }
`;

export default function Private() {
  const user = useStore(selector("admin"));
  const navigate = useNavigate();
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [collapsed, setCollapsed] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const {
    token: { borderRadiusLG },
  } = theme.useToken();

  useEffect(() => {
    const fetchInventoryData = async () => {
      try {
        const productsRef = collection(db, "products");
        const productsSnapshot = await getDocs(productsRef);
        const productsList: Product[] = productsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[];

        const categoriesRef = collection(db, "categories");
        const categoriesSnapshot = await getDocs(categoriesRef);
        const categoriesList: Category[] = categoriesSnapshot.docs.map(
          (doc) => ({
            id: doc.id,
            ...doc.data(),
          })
        ) as Category[];
        const productsWithCategory = productsList.map((product) => {
          const category = categoriesList.find(
            (cat) => cat.id === product.category
          );
          return {
            ...product,
            categoryName: category ? category.name : "Unknown Category",
          };
        });
        const lowStockItems = productsList.filter(
          (product) => Number(product.stock) <= LOW_STOCK_THRESHOLD
        );
        setLowStockProducts(lowStockItems);
        setProducts(productsWithCategory);
      } catch (error) {
        console.error("Error fetching inventory data:", error);
      }
    };

    fetchInventoryData();
  }, [db]);

  const handleMenuClick = (key: string) => {
    navigate(key);
  };

  const handleLogout = () => {
    console.log("Logging out...");
    logoutAdmin();
    navigate(RouterUrl.Login);
  };

  const popoverContent = (
    <Menu
      style={{ width: "100px" }}
      onClick={({ key }) => {
        if (key === "logout") {
          handleLogout();
        } else if (key === "settings") {
          setIsModalVisible(true);
        }
      }}
      items={[
        { key: "settings", label: "Settings" },
        { key: "logout", label: "Logout" },
      ]}
    />
  );
  const notificationMenu = (
    <div
      style={{
        maxHeight: "300px", // Set a maximum height for the dropdown
        overflowY: "auto", // Enable scrolling if items overflow
        padding: "10px",
        backgroundColor: "white", // Light background for better contrast
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)", // Subtle shadow for depth
        borderRadius: "8px",
      }}
    >
      <h1 className="text-2xl">Notifications</h1>
      <ul style={{background:'transparent'}} className="mt-4">
        {lowStockProducts.length === 0 ? (
          <li
            style={{
              textAlign: "center",
              color: "#888",
              fontWeight: "bold",
              padding: "16px",
              fontSize: "14px",
            }}
          >
            <span>No low-stock items</span>
          </li>
        ) : (
          lowStockProducts.map((product) => (
            <li
              key={product.id}
               className="mb-4"
            >
              <div className="flex flex-nowrap">
                <div>
                  {/* Product Image */}
                  {product.image ? (
                    <Avatar
                      src={product.image}
                      alt={product.name}
                      size={50}
                      style={{
                        marginRight: "16px",
                        border: "2px solid #87d068",
                      }}
                    />
                  ) : (
                    <Avatar
                      size={50}
                      style={{
                        marginRight: "16px",
                        backgroundColor: "#f56a00",
                        verticalAlign: "middle",
                        fontSize: "20px",
                      }}
                    >
                      {product.name.charAt(0).toUpperCase()}
                    </Avatar>
                  )}
                </div>
                <div>
                  {/* Product Details */}
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontWeight: "600",
                        fontSize: "16px",
                        color: "#333",
                        marginBottom: "4px",
                      }}
                    >
                      {product.name}
                    </div>
                    <div style={{ fontSize: "14px", color: "#555" }}>
                      Stock:{" "}
                      <span
                        style={{
                          color: "#ff4d4f",
                          fontWeight: "bold",
                        }}
                      >
                        {product.stock}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#999",
                        marginTop: "4px",
                      }}
                    >
                      ⚠️ Stock is running low! Consider restocking this item
                      soon.
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );

  return !user.isAuthenticated ? (
    <Navigate replace to={RouterUrl.Login} />
  ) : (
    <Layout className="h-max min-h-screen">
      <StyledSider
        width={"20%"}
        style={{ background: "#B0E0E6" }}
        className="custom-menu"
        trigger={null}
        collapsible
        collapsed={collapsed}
      >
        <div className="p-4">
          <p className="font-grand-hotel text-4xl text-black line-clamp-1">
            D’ Sweet Fix
          </p>
          <p className="text-black text-lg line-clamp-1">
            BAKING & CONFECTIONERY SHOP
          </p>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={["1"]}
          style={{ background: "#B0E0E6", color: "white" }}
          onClick={({ key }) => handleMenuClick(key)}
          items={[
            {
              key: RouterUrl.AdminDashboard,
              icon: <TbLayoutDashboardFilled />,
              label: "Dashboard",
            },
            {
              key: "2",
              label: "Management",
              style: { background: "#B0E0E6" },
              children: [
                {
                  key: "9",
                  label: "Staff",
                  icon: <TiGroupOutline />,
                  children: [
                    {
                      key: RouterUrl.StaffList,
                      label: "Staff List",
                      icon: <BsList />,
                    },
                    {
                      key: RouterUrl.StaffAdd,
                      label: "Create Staff",
                      icon: <MdOutlineAdd />,
                    },
                  ],
                },
                {
                  key: "10",
                  label: "Inventory",
                  icon: <MdOutlineInventory />,
                  children: [
                    {
                      key: RouterUrl.InventoryList,
                      label: "Inventory List",
                      icon: <BsList />,
                    },
                    {
                      key: RouterUrl.InventoryCreation,
                      label: "Add Inventory Item",
                      icon: <MdOutlineAdd />,
                    },
                  ],
                },
                {
                  key: "sub3",
                  label: "Category",
                  icon: <TbCategoryFilled />,
                  children: [
                    {
                      key: RouterUrl.CategoryList,
                      label: "Category List",
                      icon: <BsList />,
                    },
                    {
                      key: RouterUrl.CategoryCreation,
                      label: "Add Category",
                      icon: <MdOutlineAdd />,
                    },
                  ],
                },
              ],
            },
            {
              key: "3",
              label: "Analytics",
              children: [
                {
                  key: RouterUrl.AdminSales,
                  label: "Sales",
                  icon: <GrMoney />,
                },
                {
                  key: RouterUrl.Reports,
                  label: "Reports",
                  icon: <TbReportSearch />,
                },
                // {
                //   key: RouterUrl.Income,
                //   label: "Income",
                //   icon: <TbMoneybag />,
                // },
              ],
            },
          ]}
        />
      </StyledSider>
      <Layout>
        <Header
          style={{
            padding: 0,
            background: "#FFD1DC",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingRight: "12px",
            color: "white",
          }}
        >
          <Button
            type="text"
            icon={
              collapsed ? (
                <MenuUnfoldOutlined color="white" />
              ) : (
                <MenuFoldOutlined color="white" />
              )
            }
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: "16px",
              width: 64,
              height: 64,
            }}
          />
          <div className="flex gap-4 items-center">
            <Dropdown overlay={notificationMenu} trigger={["click"]}>
              <Badge count={lowStockProducts.length} offset={[-2, 7]}>
                <Button
                  type="text"
                  icon={<BellOutlined style={{ fontSize: "24px" }} />}
                />
              </Badge>
            </Dropdown>
            <Popover
              content={popoverContent}
              trigger="click"
              placement="bottomRight"
            >
              <Avatar
                src={user?.info?.profilePicture}
                style={{ cursor: "pointer", backgroundColor: "#87d068" }}
              />
            </Popover>
          </div>
        </Header>
        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            minHeight: 280,
            background: "#FFD1DC",
            borderRadius: borderRadiusLG,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
      <AdminProfileModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
      />
    </Layout>
  );
}
