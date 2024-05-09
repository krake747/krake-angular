import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable, inject, isDevMode } from "@angular/core";
import { Observable, catchError, of, retry, tap, throwError } from "rxjs";

export interface Portfolio {
    id: string;
    name: string;
    currency: string;
    investments: PortfolioInvestment[];
}

export interface PortfolioInvestment {
    instrumentId: string;
    instrumentName: string;
    instrumentCurrency: string;
    instrumentMic: string;
    instrumentSector: string;
    instrumentSymbol: string;
    instrumentIsin: string;
    purchaseDate: string;
    purchasePrice: number;
    quantity: number;
}

export abstract class ApiEndpoints {
    static ApiBase = "/api";
    static readonly PortfolioInvestments: string = `${this.ApiBase}/portfolios/investments`;
}

@Injectable({
    providedIn: "root"
})
export class PortfolioService {
    private readonly http = inject(HttpClient);
    private endpoint = isDevMode()
        ? ApiEndpoints.PortfolioInvestments
        : "assets/portfolios/investments/investments.json";

    #portfolios: Portfolio[] = [];
    constructor() {}

    listPortfoliosWithInvestments(): Observable<Portfolio[]> {
        return this.#portfolios.length
            ? of(this.#portfolios)
            : this.http.get<Portfolio[]>(this.endpoint).pipe(
                  tap(portfolios => (this.#portfolios = portfolios)),
                  retry({ count: 2, delay: 5000 }),
                  catchError(this.handleError)
              );
    }

    public handleError(err: HttpErrorResponse): Observable<never> {
        if (err.error instanceof ErrorEvent) {
            console.warn("Client", err.message); // client-side
        } else {
            console.warn("Server", err.status); // server-side
        }

        return throwError(() => new Error(err.message));
    }
}
