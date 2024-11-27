/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { getFirestore, collection, getDocs, orderBy, query, Timestamp } from "firebase/firestore";
import { Table, Button, Select, message } from "antd";
import { format } from "date-fns";
import { currencyFormat } from "../../../../utils/utils";
import { saveAs } from "file-saver";

const { Option } = Select;

interface Order {
  id: string;
  cartItems: any[];
  subtotal: number;
  grandTotal: number;
  paymentAmount: number;
  change: number;
  paymentMethod: string;
  timestamp: Timestamp | Date; // Add this line
}

export const AdminSalesPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [filterRange, setFilterRange] = useState<string>("all");
  const db = getFirestore();

  // Fetch all orders from Firestore
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const ordersCollectionRef = collection(db, "orders");
        const ordersQuery = query(ordersCollectionRef, orderBy("timestamp", "desc"));
        const ordersSnapshot = await getDocs(ordersQuery);
        const ordersList: Order[] = ordersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Order[];

        setOrders(ordersList);
        setFilteredOrders(ordersList); // Set the default filtered orders
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, [db]);
  const filterOrders = (range: string) => {
    const now = new Date();
    let filtered: Order[] = [];
  
    switch (range) {
      case "weekly":
        filtered = orders.filter((order) =>
          (order.timestamp instanceof Date
            ? order.timestamp
            : (order.timestamp as Timestamp).toDate()) >
          new Date(now.setDate(now.getDate() - 7))
        );
        break;
      case "monthly":
        filtered = orders.filter((order) =>
          (order.timestamp instanceof Date
            ? order.timestamp
            : (order.timestamp as Timestamp).toDate()) >
          new Date(now.setMonth(now.getMonth() - 1))
        );
        break;
      case "all":
      default:
        filtered = orders;
    }
  
    setFilteredOrders(filtered);
    setFilterRange(range);
  };
  
  

  // Export filtered orders to CSV
  const exportToCSV = () => {
    if (filteredOrders.length === 0) {
      message.warning("No sales data available for export.");
      return;
    }
  
    const csvHeaders = [
      "Order ID,Total Items,Subtotal,Grand Total,Payment Amount,Change,Payment Method,Date & Time",
    ];
    const csvRows = filteredOrders.map((order) => {
      const totalItems = order.cartItems.length || 0;
      const formattedDate = format(
        order.timestamp instanceof Date
          ? order.timestamp
          : order.timestamp.toDate(),
        "MMMM dd, yyyy HH:mm:ss"
      );
      return [
        order.id,
        totalItems,
        order.subtotal,
        order.grandTotal,
        order.paymentAmount,
        order.change,
        order.paymentMethod,
        formattedDate,
      ].join(",");
    });
  
    const csvContent = [csvHeaders.join("\n"), csvRows.join("\n")].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `sales-${filterRange}.csv`);
    message.success("Sales data exported successfully!");
  };
  

  const columns = [
    {
      title: "Order ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Total Items",
      dataIndex: "cartItems",
      key: "subtotal",
      render: (cartItems: any) => `${cartItems.length}`,
    },
    {
      title: "Subtotal",
      dataIndex: "subtotal",
      key: "subtotal",
      render: (price: number) => `${currencyFormat(price)}`,
    },
    {
      title: "Grand Total",
      dataIndex: "grandTotal",
      key: "grandTotal",
      render: (price: number) => `${currencyFormat(price)}`,
    },
    {
      title: "Payment Amount",
      dataIndex: "paymentAmount",
      key: "paymentAmount",
      render: (price: number) => `${currencyFormat(price)}`,
    },
    {
      title: "Change",
      dataIndex: "change",
      key: "change",
      render: (price: number) => `${currencyFormat(price)}`,
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

  const expandableContent = (record: Order) => (
    <Table
      dataSource={record.cartItems}
      columns={[
        {
          title: "Product Name",
          dataIndex: "productName",
          key: "productName",
        },
        {
          title: "Category",
          dataIndex: "category",
          key: "category",
        },
        {
          title: "Quantity",
          dataIndex: "quantity",
          key: "quantity",
        },
        {
          title: "Price",
          dataIndex: "price",
          key: "price",
          render: (price: number) => `${currencyFormat(price)}`,
        },
        {
          title: "Total",
          dataIndex: "total",
          key: "total",
          render: (total: number) => `${currencyFormat(total)}`,
        },
      ]}
      pagination={false}
      rowKey="productId"
    />
  );

  return (
    <div className="min-h-screen p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-3xl">Sales Orders</h2>
        <div className="flex gap-4">
          <Select
            defaultValue="all"
            onChange={filterOrders}
            className="w-40"
          >
            <Option value="all">All</Option>
            <Option value="weekly">Weekly</Option>
            <Option value="monthly">Monthly</Option>
          </Select>
          <Button type="primary" onClick={exportToCSV}>
            Export to CSV
          </Button>
        </div>
      </div>
      <Table
        columns={columns}
        dataSource={filteredOrders}
        expandable={{
          expandedRowRender: expandableContent,
        }}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};
