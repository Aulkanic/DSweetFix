/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Category {
    id: string;
    name: string;
  }
  
export  interface Product {
    returnDays: any;
    returnPolicy: any;
    id: string;
    name: string;
    category: string;
    price: number;
    stock: number;
    status: string;
    image: string;
    description: string;
  }
  
 export interface Order {
    transactionCode: any;
    id: string;
    cartItems: Array<{
      category: any;
      productId: string;
      productName: string;
      quantity: number;
      price: number;
      total: number;
    }>;
    subtotal: number;
    grandTotal: number;
    paymentAmount: number;
    change: number;
    paymentMethod: string;
    timestamp: Date;
  }

 export interface UserData {
    id: string;
    username: string;
    email: string;
    type: string;
    status:string;
  }