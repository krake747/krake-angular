import { HttpClient } from "@angular/common/http";
import { Injectable, computed, inject, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import {
    EMPTY,
    Observable,
    Subject,
    catchError,
    concatMap,
    merge,
    mergeMap,
    retry,
    startWith,
    switchMap,
    tap
} from "rxjs";
import { CreatePortfolio, Portfolio, PortfolioId, UpdatePortfolio } from "./portfolios.models";

abstract class ApiEndpoints {
    private static apiBase = "/api";
    static readonly Portfolios: string = `${this.apiBase}/portfolios`;
    static Portfolio(portfolioId: PortfolioId): string {
        return `${this.apiBase}/portfolios/${portfolioId}`;
    }
}

export interface PortfoliosState {
    portfolios: Portfolio[];
    loaded: boolean;
    error: string | null;
}

@Injectable()
export class PortfoliosService {
    private readonly http = inject(HttpClient);

    // state
    private readonly state = signal<PortfoliosState>({
        portfolios: [],
        loaded: false,
        error: null
    });

    // selectors
    portfolios = computed(() => this.state().portfolios);
    loadeed = computed(() => this.state().loaded);

    // sources
    create$ = new Subject<CreatePortfolio>();
    update$ = new Subject<UpdatePortfolio>();

    private portfolioCreated$ = this.create$.pipe(
        concatMap(createPortfolio =>
            this.http.post<PortfolioId>(ApiEndpoints.Portfolios, createPortfolio).pipe(catchError(this.handleError))
        )
    );

    private portfolioUpdated$ = this.update$.pipe(
        tap(x => console.log("Portfolio updated", x)),
        mergeMap(updatePortfolio =>
            this.http
                .put(ApiEndpoints.Portfolio(updatePortfolio.portfolioId), updatePortfolio.data)
                .pipe(catchError(this.handleError))
        )
    );

    constructor() {
        // reducers
        merge(this.portfolioCreated$, this.portfolioUpdated$)
            .pipe(
                startWith(null),
                switchMap(() =>
                    this.http
                        .get<Portfolio[]>(ApiEndpoints.Portfolios)
                        .pipe(retry({ count: 2, delay: 5000 }), catchError(this.handleError))
                ),
                takeUntilDestroyed()
            )
            .subscribe({
                next: portfolios =>
                    this.state.update(state => ({
                        ...state,
                        portfolios,
                        loaded: true
                    }))
            });
    }

    getPortfolioById(id: PortfolioId): Observable<Portfolio> {
        console.log("Get by id ", id);
        return this.http
            .get<Portfolio>(ApiEndpoints.Portfolio(id))
            .pipe(retry({ count: 2, delay: 5000 }), catchError(this.handleError));
    }

    private handleError(err: string | null) {
        this.state.update(state => ({ ...state, error: err }));
        return EMPTY;
    }
}
