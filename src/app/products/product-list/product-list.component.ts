import { Component, inject } from '@angular/core';
import { NgIf, NgFor, NgClass, AsyncPipe } from '@angular/common';
import { ProductDetailComponent } from '../product-detail/product-detail.component';
import { ProductService } from '../product.service';
import { EMPTY, catchError, tap } from 'rxjs';

@Component({
    selector: 'pm-product-list',
    templateUrl: './product-list.component.html',
    standalone: true,
    imports: [NgIf, NgFor, NgClass, ProductDetailComponent, AsyncPipe]
})
export class ProductListComponent{
  // Just enough here for the template to compile
  pageTitle = 'Products';
  errorMessage = '';

  private productService = inject(ProductService);

  // Products
  // use declarative approach
  // readonly products$ = this.productService.products$
  // .pipe(
  //   tap(() => console.log(`In component pipeline`)),
  //   catchError(error => {
  //     this.errorMessage = error;
  //     return EMPTY;
  //   })
  // );
  products = this.productService.products;

  // Selected product id to highlight the entry
  // create a local variable that only bind from a template to a component, 
  //   NOT a template to a service
  readonly selectedProductId$ = this.productService.productSelected$;

  onSelected(productId: number): void {
    // this.selectedProductId = productId;
    this.productService.productSelected(productId);
  }
}
