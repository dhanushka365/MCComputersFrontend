export interface InvoiceProductDto {
  productId: number;
  quantity: number;
}

export interface CreateInvoiceDto {
  transactionDate: string;
  discount?: number;
  products: InvoiceProductDto[];
}

export interface InvoiceItemResponseDto {
  id: number;
  productId: number;
  productName: string;
  productPrice: number;
  quantity: number;
  totalPrice: number;
}

export interface InvoiceResponseDto {
  id: number;
  transactionDate: string;
  discount?: number;
  totalAmount: number;
  balanceAmount: number;
  items: InvoiceItemResponseDto[];
}

export interface InvoiceItem {
  product: any;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}
