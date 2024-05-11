import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable, computed, inject, isDevMode, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { EMPTY, Observable, Subject, catchError, retry, switchMap, throwError } from "rxjs";

export interface InstrumentPrice {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    adjustedClose: number;
    volume: number;
}

export interface InstrumentPrices {
    instrumentId: string;
    prices: InstrumentPrice[];
}

export interface InstrumentReturn {
    date: string;
    value: number;
}

export interface IntrumentPricesState {
    instrumentId: string | null;
    prices: InstrumentPrice[];
    returns: InstrumentReturn[];
}

@Injectable({
    providedIn: "root"
})
export class InstrumentService {
    private readonly http = inject(HttpClient);

    // state
    private state = signal<IntrumentPricesState>({
        instrumentId: null,
        prices: [],
        returns: []
    });

    // selectors
    instrumentId = computed(() => this.state().instrumentId);
    prices = computed(() => this.state().prices);
    returns = computed(() => simpleReturns(this.state().prices));

    // sources
    public instrumentClicked$ = new Subject<string | null>();
    private instrumentChanged$ = this.instrumentClicked$.pipe(switchMap(id => this.getInstrumentPricesById(id)));

    public constructor() {
        // reducers
        this.instrumentChanged$.pipe(takeUntilDestroyed()).subscribe(response => {
            this.state.update(state => ({
                ...state,
                instrumentId: response.instrumentId,
                prices: [...response.prices]
            }));
        });
    }

    private getInstrumentPricesById(instrumentId: string | null): Observable<InstrumentPrices> {
        if (instrumentId === null) {
            return EMPTY;
        }
        return this.http
            .get<InstrumentPrices>(
                isDevMode()
                    ? ApiEndpoints.InstrumentPrices(instrumentId)
                    : `assets/portfolios/instruments/${instrumentId}.json`
            )
            .pipe(retry({ count: 2, delay: 5000 }), catchError(this.handleError));
    }

    private handleError(err: HttpErrorResponse): Observable<never> {
        if (err.error instanceof ErrorEvent) {
            console.warn("Client", err.message);
        } else {
            console.warn("Server", err.status);
        }

        return throwError(() => new Error(err.message));
    }
}

abstract class ApiEndpoints {
    static ApiBase = "/api";
    static InstrumentPrices(id: string): string {
        return `${this.ApiBase}/instruments/${id}/prices`;
    }
}

function simpleReturns(prices: InstrumentPrice[]): InstrumentReturn[] {
    const returns = [];
    for (let i = 1; i < prices.length; i++) {
        const previousPrice = prices[i - 1].close;
        const currentPrice = prices[i].close;
        const currentDate = prices[i].date;
        returns.push({ date: currentDate, value: currentPrice / previousPrice - 1 });
    }

    return returns;
}
