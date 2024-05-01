import { Component, Input, inject } from '@angular/core';
import { NgIf, NgFor, CurrencyPipe, AsyncPipe } from '@angular/common';
import { Product } from '../product';
import { EMPTY, Subscription, catchError } from 'rxjs';
import { ProductService } from '../product.service';

@Component({
    selector: 'pm-product-detail',
    templateUrl: './product-detail.component.html',
    standalone: true,
    imports: [NgIf, NgFor, CurrencyPipe, AsyncPipe]
})
export class ProductDetailComponent {
  @Input() productId: number = 0;
  errorMessage = '';
  sub!: Subscription;

  private productService = inject(ProductService);

  // Product to display
  product$ = this.productService.product$
    .pipe(
      catchError(error => {
        this.errorMessage = error;
        return EMPTY;
      })
    );

  // Set the page title
  // pageTitle = this.product ? `Product Detail for: ${this.product.productName}` : 'Product Detail';
  pageTitle = `ProductDetail`;

  addToCart(product: Product) {
  }
}
