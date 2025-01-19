/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import { Table, Card, Statistic, Row, Col, Select, DatePicker } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Bar, BarChart } from 'recharts';
import { format } from 'date-fns';
import { Category, Order } from '../../../../types';
const { RangePicker } = DatePicker;
const { Option } = Select;

export const AdminHomepage = () => {
  const [totalIncome, setTotalIncome] = useState<number>(0);
  const [orderCount, setOrderCount] = useState<number>(0);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [productData, setProductData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [filterType, setFilterType] = useState<string>('daily');
  const [selectedRange, setSelectedRange] = useState<any>(null);
  const [totalProfit, setTotalProfit] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);


  const db = getFirestore();

  const fetchFilteredData = async () => {
    try {
      setLoading(true);
      const ordersCollectionRef = collection(db, "orders");
      let ordersQuery = query(ordersCollectionRef);

      if (selectedRange && selectedRange.length === 2) {
        const [start, end] = selectedRange;
        ordersQuery = query(
          ordersCollectionRef,
          where("timestamp", ">=", start.toDate()),
          where("timestamp", "<=", end.toDate())
        );
      }

      const ordersSnapshot = await getDocs(ordersQuery);
      const ordersList = ordersSnapshot.docs.map((doc) => {
        const data = doc.data();
        let timestamp;
      
        // Convert Firestore Timestamp to JavaScript Date
        if (data.timestamp && typeof data.timestamp.toDate === "function") {
          timestamp = data.timestamp; // Convert Firestore Timestamp to Date
        } else {
          timestamp = null; // Handle unexpected formats
        }
      
        return {
          id: doc.id,
          ...data,
          timestamp, // Ensure timestamp is a Date object
        };
      }) as Order[];

      const totalIncomeValue = ordersList.reduce(
        (sum, order: any) => Number(sum) + (Number(order.grandTotal) || 0),
        0
      );
      setTotalIncome(totalIncomeValue);
      setOrderCount(ordersList.length);

      const recentOrdersList = ordersList
      .sort((a:any, b:any) => {
        const timeA = a.timestamp?.toDate ? a.timestamp.toDate().getTime() : 0; // Check if `toDate` exists
        const timeB = b.timestamp?.toDate ? b.timestamp.toDate().getTime() : 0;
        return timeB - timeA; // Sort by descending timestamp
      })
      .slice(0, 5);
    setRecentOrders(recentOrdersList);
      const productSales: { [key: string]: number } = {};
      const productsCollectionRef = collection(db, "products");
      const productsSnapshot = await getDocs(productsCollectionRef);
      const productsList:any[] = productsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      productsList?.shift()
      
      let totalCost = 0;
      let totalRevenue = 0;
      ordersList.forEach((order) => {
        order?.cartItems?.forEach((item: any) => {
          const product = productsList?.find((p: any) => p.id === item.productId); // Match product
      
          if(product){
            const unitCost = product?.priceUnit || 0; 
            totalCost += unitCost * Number(item.quantity); // Total cost
            totalRevenue += Number(item.price) * Number(item.quantity); // Total revenue
          }

        });
      });
      
      const profit = totalRevenue - totalCost;
      setTotalProfit(profit);
      const productData = Object.keys(productSales).map((productName) => ({
        name: productName,
        sales: productSales[productName],
      }));
      setProductData(productData);

      const categoriesRef = collection(db, "categories");
      const categoriesSnapshot = await getDocs(categoriesRef);
      const categoriesList: Category[] = categoriesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Category[];
      const categoryCounts: { [key: string]: number } = {};
      ordersList.forEach((order) => {
        order?.cartItems?.forEach((item: any) => {
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
      setLoading(false); // End loading after data is fetched
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false); // End loading on error
    }
  };

  useEffect(() => {
    fetchFilteredData();
  }, [selectedRange,filterType]);

  const handleFilterChange = (value: string) => {
    setFilterType(value);
    setSelectedRange(null);
  };

  const handleDateChange = (dates: any) => {
    setSelectedRange(dates);
  };

  const columns = [
    {
      title: "Order ID",
      dataIndex: "id",
      key: "id",
      render: (id: string) => id.substring(0, 6),
    },
    {
      title: "Subtotal",
      dataIndex: "subtotal",
      key: "subtotal",
    },
    {
      title: "Grand Total",
      dataIndex: "grandTotal",
      key: "grandTotal",
    },
    {
      title: "Payment Method",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
    },
    {
      title: "Date & Time",
      dataIndex: "timestamp",
      key: "timestamp",
      render: (timestamp: any) =>
        format(timestamp?.toDate(), "MMMM dd, yyyy HH:mm:ss"),
    },
  ];
  return (
    <div className="min-h-screen p-4">
      <h2 className="text-3xl mb-4">Dashboard</h2>
      <Row gutter={16} className="mb-4">
        <Col span={8}>
          <Select value={filterType} onChange={handleFilterChange} style={{ width: '100%' }}>
            <Option value="daily">Daily</Option>
            <Option value="weekly">Weekly</Option>
            <Option value="monthly">Monthly</Option>
            <Option value="yearly">Yearly</Option>
          </Select>
        </Col>
        <Col span={16}>
          {(filterType === 'weekly' || filterType === 'daily' || filterType === 'monthly' || filterType === 'yearly') && (
            <RangePicker
              picker={
                filterType === 'monthly'
                  ? 'month'
                  : filterType === 'yearly'
                  ? 'year'
                  : undefined
              }
              onChange={handleDateChange}
            />
          )}
        </Col>
      </Row>
      <Row gutter={16} className="mb-4">
        <Col span={8}>
          <Card>
            <Statistic title="Total Income" value={loading ? 'Calculating' : totalIncome} prefix="₱" />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="Number of Orders" value={loading ? 'Calculating' : orderCount} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="Total Profit" value={loading ? 'Calculating' : totalProfit} prefix="₱" />
          </Card>
        </Col>
      </Row>
      <Card title="Recent Orders" className="mb-4">
        <Table
          columns={columns}
          dataSource={recentOrders}
          rowKey="id"
          pagination={false}
        />
      </Card>
      <Row gutter={16}>
        <Col span={12}>
          <Card title="Product Sales">
            <BarChart
              width={600}
              height={300}
              data={productData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="sales" fill="#8884d8" />
            </BarChart>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Category Sales">
            <LineChart width={600} height={300} data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="sales" stroke="#82ca9d" />
            </LineChart>
          </Card>
        </Col>
      </Row>
    </div>
  );
};