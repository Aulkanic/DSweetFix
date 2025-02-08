/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { Table, Tag } from "antd";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../../db";

interface User {
  key: string;
  id:string;
  username: string;
  email: string;
  status: string;
  type: string;
  profilePicture: string;
  totalSales: number;
}

const SaleStaff: React.FC = () => {
  const [staffSales, setStaffSales] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchSalesStaff = async () => {
      try {
        const usersSnapshot = await getDocs(
            query(collection(db, "users"), where("type", "==", "staff"))
          );
          const ordersSnapshot = await getDocs(collection(db, "orders"));
  
          const users = usersSnapshot.docs.map((doc) => ({
            key: doc.id,
            ...doc.data(),
          })) as User[];
        const orders = ordersSnapshot.docs.map((doc) => doc.data());

        const staffList = users.map((user) => {
            console.log(user)
          const totalSales = orders
            .filter((order) => order.staff === user.key)
            .reduce((sum, order) => sum + Number(order.grandTotal), 0);
          return { ...user, totalSales };
        });

        setStaffSales(staffList);
      } catch (error) {
        console.error("Error fetching staff sales: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSalesStaff();
  }, []);

  const columns = [
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
      sorter: (a: User, b: User) => a.username.localeCompare(b.username),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "Active" ? "green" : "red"}>{status}</Tag>
      ),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
    },
    {
      title: "Total Sales",
      dataIndex: "totalSales",
      key: "totalSales",
      render:((v:any) => `₱${v}`),
      sorter: (a: User, b: User) => a.totalSales - b.totalSales,
    },
    {
      title: "Profile Picture",
      dataIndex: "profilePicture",
      key: "profilePicture",
      render: (url: string) => (
        <img
          src={url}
          alt="Profile"
          className="w-10 h-10 rounded-full object-cover"
        />
      ),
    },
  ];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Sales Staff List</h2>
      <Table columns={columns} dataSource={staffSales} loading={loading} />
    </div>
  );
};

export default SaleStaff;
