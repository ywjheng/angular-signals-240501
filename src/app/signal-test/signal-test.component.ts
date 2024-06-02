import { Component, effect, signal } from '@angular/core';
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
