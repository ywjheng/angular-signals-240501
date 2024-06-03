import { Component, computed, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'pm-signal-test',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './signal-test.component.html',
  styleUrls: ['./signal-test.component.css']
})
export class SignalTestComponent {
  quantity = signal(1);
  qtyAvailable = signal([1, 2, 3, 4, 5, 6]);
  selectedProduct = signal<Product>({
    id: 5,
    name: 'Hammer',
    price: 12
  });
  exPrice = computed(() => this.selectedProduct().price * this.quantity());
  color = computed(() => this.exPrice() > 50 ? 'green' : 'blue');
  e = effect(() => console.log(`In effect, price: ${this.exPrice()}`));

  constructor() {
    console.log(`In constructor: ${this.quantity()}`);
    effect(() => console.log(`In effect: ${this.quantity()}`));
    this.quantity.update(q => q * 2);
  }

  onQuantitySelected(qty: number) {
    this.quantity.set(qty);
  }
}
 
export interface Product {
  id: number;
  name: string;
  price: number;
}
