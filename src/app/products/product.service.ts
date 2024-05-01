import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of, tap, throwError } from 'rxjs';
import { Product } from './product';
import { ProductData } from './product-data';
import { HttpErrorService } from '../utilities/http-error.service';

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

  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.productsUrl)
    .pipe(
      tap(() => console.log(`In http.get pipeline`)),
      catchError((error => this.handleError(error)))
      // catchError(error => {
      //   console.error(error);
      //   return of(ProductData.products);
      // })
    );
  }

  getProduct(id: number): Observable<Product> {
    const productUrl = `${this.productsUrl}/${id}`;
    return this.http.get<Product>(productUrl)
    .pipe(
      tap(() => console.log(`In http.get by id pipeline`)),
    );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    const formattedMessage = this.errorService.formatError(error);
    return throwError(() => formattedMessage);
    // throw formattedMessage;
  }

}
