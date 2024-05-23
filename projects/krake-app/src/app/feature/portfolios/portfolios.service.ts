import { HttpClient } from "@angular/common/http";
import { Injectable, computed, effect, inject, signal } from "@angular/core";
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
import { CreatePortfolio, DeletePortfolio, Portfolio, PortfolioId, UpdatePortfolio } from "./portfolios.models";

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
    loaded = computed(() => this.state().loaded);

    // sources
    create$ = new Subject<CreatePortfolio>();
    update$ = new Subject<UpdatePortfolio>();
    delete$ = new Subject<DeletePortfolio>();

    private portfolioCreated$ = this.create$.pipe(
        tap(res => console.log("Create", res)),
        concatMap(createPortfolio =>
            this.http.post<PortfolioId>(ApiEndpoints.Portfolios, createPortfolio, { observe: "response" }).pipe(
                tap(res => console.log("Create Inner", res)),
                catchError(this.handleError)
            )
        )
    );

    private portfolioUpdated$ = this.update$.pipe(
        mergeMap(updatePortfolio =>
            this.http
                .put(ApiEndpoints.Portfolio(updatePortfolio.portfolioId), updatePortfolio.data)
                .pipe(catchError(this.handleError))
        )
    );

    private portfolioDeleted$ = this.delete$.pipe(
        concatMap(deletePortfolio =>
            this.http.delete(ApiEndpoints.Portfolio(deletePortfolio)).pipe(catchError(this.handleError))
        )
    );

    constructor() {
        // reducers
        merge(this.portfolioCreated$, this.portfolioUpdated$, this.portfolioDeleted$)
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

        // effects
        effect(() => {
            if (this.loaded()) {
                console.log("Portfolios Service state", this.state());
            }
        });
    }

    getPortfolioById(id: PortfolioId): Observable<Portfolio> {
        return this.http
            .get<Portfolio>(ApiEndpoints.Portfolio(id))
            .pipe(retry({ count: 2, delay: 5000 }), catchError(this.handleError));
    }

    private handleError(err: string | null): Observable<never> {
        this.state.update(state => ({ ...state, error: err }));
        return EMPTY;
    }
}
