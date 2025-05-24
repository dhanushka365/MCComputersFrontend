import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './product-management.component.html',
  styleUrls: ['./product-management.component.css']
})
export class ProductManagementComponent implements OnInit {
  productForm: FormGroup;
  products = signal<Product[]>([]);
  categories = signal<string[]>([]);
  filteredProducts = signal<Product[]>([]);
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  isLoading = signal(false);
  showSuccess = signal(false);
  successMessage = signal('');
  editingProduct: Product | null = null;
  selectedCategory = signal<string>('all');
  searchTerm = signal<string>('');

  constructor(
    private fb: FormBuilder,
    private productService: ProductService
  ) {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', [Validators.required, Validators.minLength(5)]],
      price: [0, [Validators.required, Validators.min(0.01)]],
      stockQuantity: [0, [Validators.required, Validators.min(0)]],
      category: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.isLoading.set(true);
    this.productService.getAllProducts().subscribe({
      next: (products) => {
        this.products.set(products);
        this.updateFilteredProducts();
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

  updateFilteredProducts() {
    let filtered = this.products();

    // Filter by category
    if (this.selectedCategory() !== 'all') {
      filtered = filtered.filter(p => p.category === this.selectedCategory());
    }

    // Filter by search term
    if (this.searchTerm()) {
      const term = this.searchTerm().toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term) ||
        p.category.toLowerCase().includes(term)
      );
    }

    this.filteredProducts.set(filtered);
  }

  onCategoryChange(category: string) {
    this.selectedCategory.set(category);
    this.updateFilteredProducts();
  }

  onSearchChange(event: Event) {
    const term = (event.target as HTMLInputElement).value;
    this.searchTerm.set(term);
    this.updateFilteredProducts();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please select a valid image file (JPEG, PNG, GIF, or WebP)');
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      this.selectedFile = file;

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewUrl = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  editProduct(product: Product) {
    this.editingProduct = product;
    this.productForm.patchValue({
      name: product.name,
      description: product.description,
      price: product.price,
      stockQuantity: product.stockQuantity,
      category: product.category
    });
    this.previewUrl = product.imageUrl || null;
    this.selectedFile = null;
  }

  cancelEdit() {
    this.editingProduct = null;
    this.resetForm();
  }

  deleteProduct(id: number) {
    if (confirm('Are you sure you want to delete this product?')) {
      this.isLoading.set(true);
      this.productService.deleteProduct(id).subscribe({
        next: () => {
          this.showSuccessMessage('Product deleted successfully!');
          this.loadProducts();
        },
        error: (error) => {
          console.error('Error deleting product:', error);
          this.isLoading.set(false);
        }
      });
    }
  }

  onSubmit() {
    if (this.productForm.valid) {
      this.isLoading.set(true);
      
      const formData = new FormData();
      formData.append('name', this.productForm.get('name')?.value);
      formData.append('description', this.productForm.get('description')?.value);
      formData.append('price', this.productForm.get('price')?.value);
      formData.append('stockQuantity', this.productForm.get('stockQuantity')?.value);
      formData.append('category', this.productForm.get('category')?.value);
      
      if (this.selectedFile) {
        formData.append('image', this.selectedFile);
      }

      if (this.editingProduct) {
        // Update existing product
        this.productService.updateProduct(this.editingProduct.id, formData).subscribe({
          next: () => {
            this.showSuccessMessage('Product updated successfully!');
            this.loadProducts();
            this.cancelEdit();
          },
          error: (error) => {
            console.error('Error updating product:', error);
            this.isLoading.set(false);
          }
        });
      } else {
        // Create new product
        this.productService.createProduct(formData).subscribe({
          next: () => {
            this.showSuccessMessage('Product created successfully!');
            this.loadProducts();
            this.resetForm();
          },
          error: (error) => {
            console.error('Error creating product:', error);
            this.isLoading.set(false);
          }
        });
      }
    }
  }

  resetForm() {
    this.productForm.reset();
    this.selectedFile = null;
    this.previewUrl = null;
    this.editingProduct = null;
  }

  showSuccessMessage(message: string) {
    this.successMessage.set(message);
    this.showSuccess.set(true);
    this.isLoading.set(false);
    
    setTimeout(() => this.showSuccess.set(false), 5000);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  isFormInvalid(): boolean {
    return this.productForm.invalid;
  }

  getFieldError(fieldName: string): string {
    const field = this.productForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
      }
      if (field.errors['minlength']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
      if (field.errors['min']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be greater than ${field.errors['min'].min}`;
      }
    }
    return '';
  }
}
