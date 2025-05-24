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

  constructor(private invoiceService: InvoiceService) {}

  ngOnInit() {
    this.loadInvoices();
  }

  loadInvoices() {
    this.isLoading.set(true);
    this.invoiceService.getAllInvoices().subscribe({
      next: (invoices) => {
        this.invoices.set(invoices);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading invoices:', error);
        this.isLoading.set(false);
      }
    });
  }

  viewInvoice(invoice: InvoiceResponseDto) {
    this.selectedInvoice.set(invoice);
  }

  closeInvoiceView() {
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
      month: 'long',
      day: 'numeric'
    });
  }
}
