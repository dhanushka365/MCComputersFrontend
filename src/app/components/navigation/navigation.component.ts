import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvoiceGeneratorComponent } from '../invoice-generator/invoice-generator.component';
import { ProductManagementComponent } from '../product-management/product-management.component';
import { InvoiceListComponent } from '../invoice-list/invoice-list.component';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule, InvoiceGeneratorComponent, ProductManagementComponent, InvoiceListComponent],
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent {
  activeTab = signal<'generate' | 'products' | 'list'>('generate');

  setActiveTab(tab: 'generate' | 'products' | 'list') {
    this.activeTab.set(tab);
  }
}
