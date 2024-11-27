/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { collection, getDocs, getFirestore } from "firebase/firestore";
import { Card, Select } from "antd";
import {
  CartesianGrid,
  Line,
  LineChart,
  Bar,
  BarChart,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import dayjs from "dayjs";

// Define the Category type
export interface Category {
  id: string;
  name: string; // Ensure 'name' exists
}

export const AdminReportsPage = () => {
  const [productData, setProductData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [filter, setFilter] = useState("daily");
  const db = getFirestore();

  const filterOrdersByTimeRange = (ordersList: any[], range: string) => {
    const now = dayjs();
  
    return ordersList.filter((order) => {
      // Safely access timestamp
      const orderTimestamp = order.timestamp;
      if (!orderTimestamp || !orderTimestamp.seconds) {
        console.warn(`Skipping order with invalid timestamp:`, order);
        return false; // Skip orders with missing or invalid timestamps
      }
  
      const orderDate = dayjs(orderTimestamp.seconds * 1000); // Convert to milliseconds
  
      switch (range) {
        case "daily":
          return now.isSame(orderDate, "day");
        case "weekly":
          return now.isSame(orderDate, "week");
        case "monthly":
          return now.isSame(orderDate, "month");
        case "yearly":
          return now.isSame(orderDate, "year");
        default:
          return true;
      }
    });
  };
  

  useEffect(() => {
    const fetchData = async () => {
      try {
        const ordersCollectionRef = collection(db, "orders");
        const ordersSnapshot = await getDocs(ordersCollectionRef);
        const ordersList = ordersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const filteredOrders = filterOrdersByTimeRange(ordersList, filter);

        const productSales: { [key: string]: number } = {};
        filteredOrders.forEach((order) => {
          order.cartItems.forEach((item: any) => {
            productSales[item.productName] =
              (productSales[item.productName] || 0) + item.quantity * item.price;
          });
        });
        const productData = Object.keys(productSales).map((productName) => ({
          name: productName,
          sales: productSales[productName],
        }));
        setProductData(productData);

        // Fetch Categories
        const categoriesRef = collection(db, "categories");
        const categoriesSnapshot = await getDocs(categoriesRef);
        const categoriesList: Category[] = categoriesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Category[];

        // Ensure `name` exists for each category
        const categoryCounts: { [key: string]: number } = {};
        filteredOrders.forEach((order) => {
          order.cartItems.forEach((item: any) => {
            const category = categoriesList.find(
              (v: Category) => v.name === item.category
            )?.name;
            if (category) {
              categoryCounts[category] =
                (categoryCounts[category] || 0) + item.quantity * item.price;
            }
          });
        });

        const categoryData = Object.keys(categoryCounts).map((category) => ({
          name: category,
          sales: categoryCounts[category],
        }));
        setCategoryData(categoryData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [db, filter]);

  return (
    <div className="flex flex-col gap-8 flex-nowrap">
      <div className="flex justify-end mb-4">
        <Select
          value={filter}
          onChange={(value) => setFilter(value)}
          style={{ width: 200 }}
        >
          <Select.Option value="daily">Daily</Select.Option>
          <Select.Option value="weekly">Weekly</Select.Option>
          <Select.Option value="monthly">Monthly</Select.Option>
          <Select.Option value="yearly">Yearly</Select.Option>
        </Select>
      </div>

      <Card title="Product Sales" className="w-full">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={productData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <RechartsTooltip />
            <Legend />
            <Line type="monotone" dataKey="sales" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card title="Category Sales" className="w-full">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={categoryData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <RechartsTooltip />
            <Legend />
            <Bar dataKey="sales" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};
