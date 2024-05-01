import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { EMPTY, Observable, catchError, map, of, shareReplay, switchMap, tap, throwError } from 'rxjs';
import { Product } from './product';
import { ProductData } from './product-data';
import { HttpErrorService } from '../utilities/http-error.service';
import { ReviewService } from '../reviews/review.service';
import { Review } from '../reviews/review';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private productsUrl = 'api/products';

  // ctor-based DI
  // constructor(private http: HttpClient) {}
  // NG14+ function injection
  private http = inject(HttpClient);
  private errorService = inject(HttpErrorService);
  private reviewService = inject(ReviewService);

  // use declarative approach
  readonly products$ = this.http.get<Product[]>(this.productsUrl)
  .pipe(
    tap(() => console.log(`In http.get pipeline`)),
    shareReplay(1),
    tap(() => console.log(`After shareReplay`)),
    catchError((error => this.handleError(error)))
    // catchError(error => {
    //   console.error(error);
    //   return of(ProductData.products);
    // })
  );

  getProduct(id: number): Observable<Product> {
    const productUrl = `${this.productsUrl}/${id}`;
    return this.http.get<Product>(productUrl)
    .pipe(
      tap(() => console.log(`In http.get by id pipeline`)),
      switchMap(product => this.getProductWithReviews(product)),
      catchError((error => this.handleError(error)))
    );
  }

  private getProductWithReviews(product: Product): Observable<Product> {
    if (product.hasReviews) {
      return this.http.get<Review[]>(this.reviewService.getReviewUrl(product.id))
      .pipe(
        map(reviews => ({...product, reviews } as Product))
      );
    } else {
      return of(product);
    } 
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    const formattedMessage = this.errorService.formatError(error);
    return throwError(() => formattedMessage);
    // throw formattedMessage;
  }

}
