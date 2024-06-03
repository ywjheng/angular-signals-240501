import { Injectable, computed, effect, signal } from "@angular/core";
import { CartItem } from "./cart";
import { Product } from "../products/product";

@Injectable({
  providedIn: 'root'
})
export class CartService {
  cartItems = signal<CartItem[]>([]);
  cartCount = computed(() => this.cartItems().reduce((accQty, item) => accQty + item.quantity, 0));
  subTotal = computed(() => this.cartItems().reduce((accTotal, item) => accTotal + (item.quantity * item.product.price), 0));
  deliveryFee = computed<number>(() => this.subTotal() < 50 ? 5.99 : 0);
  tax = computed(() => Math.round(this.subTotal() * 10.75) / 100);
  totalPrice = computed(() => this.subTotal() + this.deliveryFee() + this.tax());
  eLength = effect(() => console.log(`Cart array length: ${this.cartItems().length}`));

  addToCart(product: Product): void {
    // this.cartItems().push({ product, quantity: 1});
    const index = this.cartItems().findIndex(item => item.product.id === product.id);
    if (index === -1) {
      this.cartItems.update(items => [...items, { product, quantity: 1}]);
    } else {
      this.cartItems.update(items => [
        ...items.slice(0, index),
        {...items[index], quantity: items[index].quantity + 1},
        ...items.slice(index + 1)
      ]);
    }
  }

  removeFromCart(cartItem: CartItem): void {
    this.cartItems.update(items => items.filter(item => item.product.id !== cartItem.product.id));
  }

  updateQuantity(cartItem: CartItem, quantity: number): void {
    this.cartItems.update(items => items.map(item => item.product.id === cartItem.product.id ? {...item, quantity} : item));
  }
}
