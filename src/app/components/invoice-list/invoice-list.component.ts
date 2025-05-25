import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvoiceService } from '../../services/invoice.service';
import { ProductService } from '../../services/product.service';
import { InvoiceResponseDto } from '../../models/invoice.model';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './invoice-list.component.html',
  styleUrls: ['./invoice-list.component.css']
})
export class InvoiceListComponent implements OnInit {
  invoices = signal<InvoiceResponseDto[]>([]);
  products = signal<Product[]>([]);
  isLoading = signal(false);
  selectedInvoice = signal<InvoiceResponseDto | null>(null);
  searchTerm = signal<string>('');
  filteredInvoices = signal<InvoiceResponseDto[]>([]);

  constructor(
    private invoiceService: InvoiceService,
    private productService: ProductService
  ) {}

  ngOnInit() {
    this.loadInvoices();
    this.loadProducts();
  }

  loadInvoices() {
    this.isLoading.set(true);
    this.invoiceService.getAllInvoices().subscribe({
      next: (invoices) => {
        this.invoices.set(invoices);
        this.updateFilteredInvoices();
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading invoices:', error);
        this.isLoading.set(false);
      }
    });
  }

  loadProducts() {
    this.productService.getAllProducts().subscribe({
      next: (products) => {
        this.products.set(products);
      },
      error: (error) => {
        console.error('Error loading products:', error);
      }
    });
  }

  updateFilteredInvoices() {
    let filtered = this.invoices();
    
    if (this.searchTerm()) {
      const term = this.searchTerm().toLowerCase();
      filtered = filtered.filter(invoice => 
        invoice.id.toString().includes(term) ||
        invoice.transactionDate.includes(term) ||
        invoice.items.some(item => 
          item.productName.toLowerCase().includes(term)
        )
      );
    }

    this.filteredInvoices.set(filtered);
  }

  onSearchChange(event: Event) {
    const term = (event.target as HTMLInputElement).value;
    this.searchTerm.set(term);
    this.updateFilteredInvoices();
  }

  viewInvoiceDetails(invoice: InvoiceResponseDto) {
    this.selectedInvoice.set(invoice);
  }

  closeInvoiceDetails() {
    this.selectedInvoice.set(null);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  printInvoice(invoice: InvoiceResponseDto) {
    this.selectedInvoice.set(invoice);
    setTimeout(() => {
      window.print();
    }, 100);
  }

  printSelectedInvoice() {
    window.print();
  }

  calculateSubtotal(invoice: InvoiceResponseDto): number {
    return invoice.items.reduce((sum, item) => sum + item.totalPrice, 0);
  }

  calculateDiscount(invoice: InvoiceResponseDto): number {
    if (!invoice.discount) return 0;
    const subtotal = this.calculateSubtotal(invoice);
    return (subtotal * invoice.discount) / 100;
  }

  getProductById(productId: number): Product | undefined {
    return this.products().find(product => product.id === productId);
  }

  getProductImageUrl(productId: number): string | undefined {
    const product = this.getProductById(productId);
    return product?.imageUrl;
  }

  getTotalItems(invoice: InvoiceResponseDto): number {
    return invoice.items.reduce((sum, item) => sum + item.quantity, 0);
  }
}
