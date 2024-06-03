import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { BehaviorSubject, EMPTY, Observable, catchError, combineLatest, filter, map, of, shareReplay, switchMap, tap, throwError } from 'rxjs';
import { Product, Result } from './product';
import { ProductData } from './product-data';
import { HttpErrorService } from '../utilities/http-error.service';
import { ReviewService } from '../reviews/review.service';
import { Review } from '../reviews/review';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';

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

  // add private keyword to ensure that no code in the application accesses this BehaviorSubject except code within this service
  // expose this observable as public property for other code in the application to subscribe
  // private productSelectedSubject = new BehaviorSubject<number | undefined>(undefined);
  // readonly productSelected$ = this.productSelectedSubject.asObservable();
  selectedProductId = signal<number | undefined>(undefined);

  // use declarative approach
  private productsResult$ = this.http.get<Product[]>(this.productsUrl)
  .pipe(
    map(p => ({ data: p } as Result<Product[]>)),
    tap((p) => console.log(JSON.stringify(p))),
    shareReplay(1),
    // tap(() => console.log(`After shareReplay`)),
    // catchError((error => this.handleError(error)))
    catchError(error => of({ 
      data: [],
      error: this.errorService.formatError(error)
    } as Result<Product[]>))
  );

  private productsResult = toSignal(this.productsResult$, 
    { initialValue: ({ data: [] } as Result<Product[]>) });

  products = computed(() => this.productsResult().data);
  productsError = computed(() => this.productsResult().error);
  // products = computed(() => {
  //   try {
  //     return toSignal(this.products$, { initialValue: [] as Product[] })();
  //   } catch (error) {
  //     return [] as Product[];
  //   }
  // });

  private productResult$ = toObservable(this.selectedProductId)
    .pipe(
      // use filter operator to check if return data is undefined or null
      filter(Boolean),
      switchMap(id => {
        const productUrl = `${this.productsUrl}/${id}`;
        return this.http.get<Product>(productUrl)
          .pipe(
            switchMap(product => this.getProductWithReviews(product)),
            // catchError((error => this.handleError(error)))
            catchError(error => of({
              data: undefined,
              error: this.errorService.formatError(error)
            } as Result<Product>))
          );
      }),
      map(p => ({ data : p } as Result<Product>))
    );

  // Find the product in the existing array of products
  private foundProduct = computed(() => {
    // Dependent signals
    const p = this.products();
    const id = this.selectedProductId();
    if (p && id) {
      return p.find(product => product.id === id);
    }
    return undefined;
  });


  private productResult1$ = toObservable(this.foundProduct)
  .pipe(
    filter(Boolean),
    switchMap(id => {
      const productUrl = this.productsUrl + '/' + id;
      return this.http.get<Product>(productUrl)
        .pipe(
          switchMap(product => this.getProductWithReviews(product)),
          catchError(err => of({
            data: undefined,
            error: this.errorService.formatError(err)
          } as Result<Product>))
        );
    }),
    map(p => ({ data: p } as Result<Product>))
  );


  private productResult = toSignal(this.productResult$);
  product = computed(() => this.productResult()?.data);
  productError = computed(() => this.productResult()?.error);

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
    // this.productSelectedSubject.next(selectedProductId);
    this.selectedProductId.set(selectedProductId);
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

  // private handleError(error: HttpErrorResponse): Observable<never> {
  //   const formattedMessage = this.errorService.formatError(error);
  //   return throwError(() => formattedMessage);
  //   // throw formattedMessage;
  // }
}
