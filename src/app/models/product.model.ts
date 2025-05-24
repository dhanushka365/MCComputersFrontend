export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  category: string;
  imageUrl?: string;
  imageFileName?: string;
  createdDate: string;
  updatedDate?: string;
}
