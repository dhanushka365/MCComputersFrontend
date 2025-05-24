import { Routes } from '@angular/router';
import { InvoiceGeneratorComponent } from './components/invoice-generator/invoice-generator.component';
import { InvoiceListComponent } from './components/invoice-list/invoice-list.component';
import { ProductManagementComponent } from './components/product-management/product-management.component';

export const routes: Routes = [
  { path: '', redirectTo: '/invoices', pathMatch: 'full' },
  { path: 'invoices', component: InvoiceGeneratorComponent },
  { path: 'invoice-list', component: InvoiceListComponent },
  { path: 'products', component: ProductManagementComponent }
];
