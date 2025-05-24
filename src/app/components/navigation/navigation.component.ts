import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvoiceGeneratorComponent } from '../invoice-generator/invoice-generator.component';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [CommonModule, InvoiceGeneratorComponent],
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent {
  activeTab = signal<'generate' | 'list'>('generate');

  setActiveTab(tab: 'generate' | 'list') {
    this.activeTab.set(tab);
  }
}
