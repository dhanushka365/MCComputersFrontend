import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { InvoiceService } from '../../services/invoice.service';
import { Product } from '../../models/product.model';
import { CreateInvoiceDto, InvoiceItem, InvoiceResponseDto } from '../../models/invoice.model';

@Component({
  selector: 'app-invoice-generator',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './invoice-generator.component.html',
  styleUrls: ['./invoice-generator.component.css']
})
export class InvoiceGeneratorComponent implements OnInit {
  invoiceForm: FormGroup;
  products = signal<Product[]>([]);
  categories = signal<string[]>([]);
  selectedProducts = signal<InvoiceItem[]>([]);
  isLoading = signal(false);
  showSuccess = signal(false);
  lastCreatedInvoice = signal<InvoiceResponseDto | null>(null);
  
  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private invoiceService: InvoiceService
  ) {
    this.invoiceForm = this.fb.group({
      transactionDate: [new Date().toISOString().split('T')[0], Validators.required],
      discount: [0, [Validators.min(0)]],
      productItems: this.fb.array([])
    });
  }

  ngOnInit() {
    this.loadProducts();
  }

  get productItems(): FormArray {
    return this.invoiceForm.get('productItems') as FormArray;
  }

  loadProducts() {
    this.isLoading.set(true);
    this.productService.getAllProducts().subscribe({
      next: (products) => {
        this.products.set(products);
        const uniqueCategories = [...new Set(products.map(p => p.category))];
        this.categories.set(uniqueCategories);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.isLoading.set(false);
      }
    });
  }

  addProduct() {
    const productGroup = this.fb.group({
      productId: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]]
    });
    this.productItems.push(productGroup);
    this.updateSelectedProducts();
  }

  removeProduct(index: number) {
    this.productItems.removeAt(index);
    this.updateSelectedProducts();
  }

  updateSelectedProducts() {
    const items: InvoiceItem[] = [];
    this.productItems.controls.forEach(control => {
      const productId = control.get('productId')?.value;
      const quantity = control.get('quantity')?.value;
      
      if (productId && quantity > 0) {
        const product = this.products().find(p => p.id === parseInt(productId));
        if (product) {
          const totalPrice = product.price * quantity;
          items.push({
            product,
            quantity,
            unitPrice: product.price,
            totalPrice
          });
        }
      }
    });
    this.selectedProducts.set(items);
  }

  onProductChange() {
    this.updateSelectedProducts();
  }

  onQuantityChange() {
    this.updateSelectedProducts();
  }

  calculateSubtotal(): number {
    return this.selectedProducts().reduce((sum, item) => sum + item.totalPrice, 0);
  }

  calculateDiscount(): number {
    const discountPercent = this.invoiceForm.get('discount')?.value || 0;
    return (this.calculateSubtotal() * discountPercent) / 100;
  }

  calculateTotal(): number {
    return this.calculateSubtotal() - this.calculateDiscount();
  }

  onSubmit() {
    if (this.invoiceForm.valid && this.selectedProducts().length > 0) {
      this.isLoading.set(true);
      
      const formValue = this.invoiceForm.value;
      const invoiceData: CreateInvoiceDto = {
        transactionDate: formValue.transactionDate,
        discount: formValue.discount,
        products: formValue.productItems.map((item: any) => ({
          productId: parseInt(item.productId),
          quantity: item.quantity
        }))
      };

      this.invoiceService.createInvoice(invoiceData).subscribe({
        next: (response) => {
          this.lastCreatedInvoice.set(response);
          this.showSuccess.set(true);
          this.resetForm();
          this.isLoading.set(false);
          
          setTimeout(() => this.showSuccess.set(false), 5000);
        },
        error: (error) => {
          console.error('Error creating invoice:', error);
          this.isLoading.set(false);
        }
      });
    }
  }

  resetForm() {
    this.invoiceForm.reset({
      transactionDate: new Date().toISOString().split('T')[0],
      discount: 0
    });
    this.productItems.clear();
    this.selectedProducts.set([]);
  }

  getProductsInCategory(category: string): Product[] {
    return this.products().filter(p => p.category === category);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  printInvoice() {
    window.print();
  }
}
