import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent implements OnInit {
  activeTab = signal<'generate' | 'products' | 'list'>('generate');

  constructor(private router: Router) {}

  ngOnInit() {
    // Set initial active tab based on current route
    this.updateActiveTabFromRoute(this.router.url);
    
    // Listen to route changes to update active tab
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event) => {
        if (event instanceof NavigationEnd) {
          this.updateActiveTabFromRoute(event.url);
        }
      });
  }

  private updateActiveTabFromRoute(url: string) {
    if (url.includes('/products')) {
      this.activeTab.set('products');
    } else if (url.includes('/invoice-list')) {
      this.activeTab.set('list');
    } else {
      this.activeTab.set('generate');
    }
  }

  setActiveTab(tab: 'generate' | 'products' | 'list') {
    this.activeTab.set(tab);
    
    // Navigate using the router instead of direct component rendering
    switch(tab) {
      case 'generate':
        this.router.navigate(['/invoices']);
        break;
      case 'products':
        this.router.navigate(['/products']);
        break;
      case 'list':
        this.router.navigate(['/invoice-list']);
        break;
    }
  }
}
