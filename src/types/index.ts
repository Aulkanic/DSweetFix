export interface Category {
    id: string;
    name: string;
  }
  
export  interface Product {
    id: string;
    name: string;
    category: string;
    price: number;
    stock: number;
    status: string;
    image: string;
    description: string;
  }
  