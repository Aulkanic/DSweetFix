/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  orderBy,
  query,
  Timestamp,
} from "firebase/firestore";
import { Table, Button, Select, Modal, Form, Input, message, Popconfirm } from "antd";
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
  totalItems: number;
  timestamp: Timestamp | Date;
}

export const AdminSalesPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [filterRange, setFilterRange] = useState<string>("all");
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [form] = Form.useForm();
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
        setFilteredOrders(ordersList);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, [db]);

  // Filter orders based on range
  const filterOrders = (range: string) => {
    const now = new Date();
    let filtered: Order[] = [];

    switch (range) {
      case "weekly":
        filtered = orders.filter(
          (order) =>
            (order.timestamp instanceof Date
              ? order.timestamp
              : (order.timestamp as Timestamp).toDate()) >
            new Date(now.setDate(now.getDate() - 7))
        );
        break;
      case "monthly":
        filtered = orders.filter(
          (order) =>
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

  // Add new sale
  const addSale = async (values: any) => {
    try {
      const newOrder = {
        ...values,
        timestamp: Timestamp.fromDate(new Date()),
        cartItems: Array(values.totalItems).fill({}), 
      };
      const docRef = await addDoc(collection(db, "orders"), newOrder);
      const addedOrder = { id: docRef.id, ...newOrder };
      setOrders((prev) => [addedOrder, ...prev]);
      setFilteredOrders((prev) => [addedOrder, ...prev]);
      setAddModalVisible(false);
      form.resetFields();
      message.success("Sale added successfully!");
    } catch (error) {
      console.error("Error adding sale:", error);
      message.error("Failed to add sale.");
    }
  };

  // Delete sale
  const deleteSale = async (id: string) => {
    try {
      await deleteDoc(doc(db, "orders", id));
      setOrders((prev) => prev.filter((order) => order.id !== id));
      setFilteredOrders((prev) => prev.filter((order) => order.id !== id));
      message.success("Sale deleted successfully!");
    } catch (error) {
      console.error("Error deleting sale:", error);
      message.error("Failed to delete sale.");
    }
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
      const formattedDate = format(
        order.timestamp instanceof Date
          ? order.timestamp
          : order.timestamp.toDate(),
        "MMMM dd, yyyy HH:mm:ss"
      );
      return [
        order.id,
        order.totalItems,
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
      dataIndex: "totalItems",
      key: "totalItems",
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
    {
      title: "Actions",
      key: "actions",
      render: (record: Order) => (
        <div className="flex gap-2">
          <Popconfirm
            title="Are you sure you want to delete this sale?"
            onConfirm={() => deleteSale(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="primary" danger>
              Delete
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

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
          <Button type="primary" onClick={() => setAddModalVisible(true)}>
            Add Sale
          </Button>
          <Button type="primary" onClick={exportToCSV}>
            Export to CSV
          </Button>
        </div>
      </div>
      <Table
        columns={columns}
        dataSource={filteredOrders}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      {/* Add Sale Modal */}
      <Modal
        visible={addModalVisible}
        onCancel={() => setAddModalVisible(false)}
        title="Add New Sale"
        footer={null}
      >
        <Form layout="vertical" onFinish={addSale} form={form}>
          <Form.Item
            name="totalItems"
            label="Total Items"
            rules={[{ required: true, message: "Please enter the total items." }]}
          >
            <Input type="number" placeholder="Enter total items" />
          </Form.Item>
          <Form.Item
            name="subtotal"
            label="Subtotal"
            rules={[{ required: true, message: "Please enter the subtotal." }]}
          >
            <Input type="number" placeholder="Enter subtotal" />
          </Form.Item>
          <Form.Item
            name="grandTotal"
            label="Grand Total"
            rules={[{ required: true, message: "Please enter the grand total." }]}
          >
            <Input type="number" placeholder="Enter grand total" />
          </Form.Item>
          <Form.Item
            name="paymentAmount"
            label="Payment Amount"
            rules={[{ required: true, message: "Please enter the payment amount." }]}
          >
            <Input type="number" placeholder="Enter payment amount" />
          </Form.Item>
          <Form.Item
            name="change"
            label="Change"
            rules={[{ required: true, message: "Please enter the change." }]}
          >
            <Input type="number" placeholder="Enter change" />
          </Form.Item>
          <Form.Item
            name="paymentMethod"
            label="Payment Method"
            rules={[{ required: true, message: "Please select a payment method." }]}
          >
            <Select placeholder="Select payment method">
              <Option value="Cash">Cash</Option>
              <Option value="Credit Card">Credit Card</Option>
              <Option value="Online Transfer">Online Transfer</Option>
            </Select>
          </Form.Item>
          <div className="flex justify-end">
            <Button onClick={() => setAddModalVisible(false)} className="mr-2">
              Cancel
            </Button>
            <Button type="primary" htmlType="submit">
              Add Sale
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};
