import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable, inject, isDevMode } from "@angular/core";
import { Observable, catchError, of, retry, tap, throwError } from "rxjs";

export interface Portfolio {
    id: string;
    name: string;
    currency: string;
    totalCost: number;
    totalValue: number;
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
    lastestDate: string | null;
    latestPrice: number | null;
    gain: number | null;
    percentageGain: number | null;
}

@Injectable({
    providedIn: "root"
})
export class PortfolioService {
    private readonly http = inject(HttpClient);
    #portfolios: Portfolio[] = [];

    private investmentsEndpoint = isDevMode()
        ? ApiEndpoints.PortfolioInvestments
        : "assets/portfolios/investments/investments.json";

    listPortfoliosWithInvestments(): Observable<Portfolio[]> {
        return this.#portfolios.length
            ? of(this.#portfolios)
            : this.http.get<Portfolio[]>(this.investmentsEndpoint).pipe(
                  tap(portfolios => (this.#portfolios = portfolios)),
                  retry({ count: 2, delay: 5000 }),
                  catchError(this.handleError)
              );
    }

    private handleError(err: HttpErrorResponse): Observable<never> {
        if (err.error instanceof ErrorEvent) {
            console.warn("Client", err.message); // client-side
        } else {
            console.warn("Server", err.status); // server-side
        }

        return throwError(() => new Error(err.message));
    }
}

abstract class ApiEndpoints {
    static ApiBase = "/api";
    static readonly PortfolioInvestments: string = `${this.ApiBase}/portfolios/investments`;
}
