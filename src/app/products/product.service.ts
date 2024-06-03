import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, inject } from '@angular/core';
import { BehaviorSubject, EMPTY, Observable, catchError, combineLatest, filter, map, of, shareReplay, switchMap, tap, throwError } from 'rxjs';
import { Product } from './product';
import { ProductData } from './product-data';
import { HttpErrorService } from '../utilities/http-error.service';
import { ReviewService } from '../reviews/review.service';
import { Review } from '../reviews/review';
import { toSignal } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private productsUrl = 'api/productss';

  // ctor-based DI
  // constructor(private http: HttpClient) {}
  // NG14+ function injection
  private http = inject(HttpClient);
  private errorService = inject(HttpErrorService);
  private reviewService = inject(ReviewService);

  // add private keyword to ensure that no code in the application accesses this BehaviorSubject except code within this service
  private productSelectedSubject = new BehaviorSubject<number | undefined>(undefined);
  // expose this observable as public property for other code in the application to subscribe
  readonly productSelected$ = this.productSelectedSubject.asObservable();

  // use declarative approach
  private products$ = this.http.get<Product[]>(this.productsUrl)
  .pipe(
    tap((p) => console.log(JSON.stringify(p))),
    shareReplay(1),
    // tap(() => console.log(`After shareReplay`)),
    catchError((error => this.handleError(error)))
  );

  // products = toSignal(this.products$, { initialValue: [] as Product[] });
  products = computed(() => {
    try {
      return toSignal(this.products$, { initialValue: [] as Product[] })();
    } catch (error) {
      return [] as Product[];
    }
  });

  readonly product$ = this.productSelected$
    .pipe(
      // use filter operator to check if return data is undefined or null
      filter(Boolean),
      switchMap(id => {
        const productUrl = `${this.productsUrl}/${id}`;
        return this.http.get<Product>(productUrl)
          .pipe(
            switchMap(product => this.getProductWithReviews(product)),
            catchError((error => this.handleError(error)))
          );
      })
    );

  // product$ = combineLatest([
  //   this.productSelected$,
  //   this.products$
  // ]).pipe(
  //   // tap(x => x)
  //   map(([selectedProductId, products]) => 
  //     products.find(product => product.id === selectedProductId)
  //   ),
  //   filter(Boolean),
  //   switchMap(product => this.getProductWithReviews(product)),
  //   catchError(error => this.handleError(error))
  // );

  productSelected(selectedProductId: number): void {
    this.productSelectedSubject.next(selectedProductId);
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
