import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvoiceService } from '../../services/invoice.service';
import { InvoiceResponseDto } from '../../models/invoice.model';

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './invoice-list.component.html',
  styleUrls: ['./invoice-list.component.css']
})
export class InvoiceListComponent implements OnInit {
  invoices = signal<InvoiceResponseDto[]>([]);
  isLoading = signal(false);
  selectedInvoice = signal<InvoiceResponseDto | null>(null);
  searchTerm = signal<string>('');
  filteredInvoices = signal<InvoiceResponseDto[]>([]);

  constructor(private invoiceService: InvoiceService) {}

  ngOnInit() {
    this.loadInvoices();
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

  getTotalItems(invoice: InvoiceResponseDto): number {
    return invoice.items.reduce((sum, item) => sum + item.quantity, 0);
  }
}
