import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable, computed, inject, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { EMPTY, Observable, Subject, catchError, concatMap, merge, mergeMap, retry, startWith, switchMap } from "rxjs";
import {
    CreatePortfolio,
    DeletePortfolio,
    ErrorResponse,
    Portfolio,
    PortfolioId,
    UpdatePortfolio
} from "./portfolios.models";

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
    error: ErrorResponse[] | ErrorResponse | string | null;
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
    error = computed(() => this.state().error);

    // sources
    create$ = new Subject<CreatePortfolio>();
    update$ = new Subject<UpdatePortfolio>();
    delete$ = new Subject<DeletePortfolio>();

    private error$ = new Subject<ErrorResponse[] | ErrorResponse | string | null>();

    private portfolioCreated$ = this.create$.pipe(
        concatMap(createPortfolio =>
            this.http
                .post<PortfolioId>(ApiEndpoints.Portfolios, createPortfolio)
                .pipe(catchError(response => this.handleHttpError(response)))
        )
    );

    private portfolioUpdated$ = this.update$.pipe(
        mergeMap(updatePortfolio =>
            this.http
                .put(ApiEndpoints.Portfolio(updatePortfolio.portfolioId), updatePortfolio.data)
                .pipe(catchError(response => this.handleHttpError(response)))
        )
    );

    private portfolioDeleted$ = this.delete$.pipe(
        concatMap(deletePortfolio =>
            this.http
                .delete(ApiEndpoints.Portfolio(deletePortfolio))
                .pipe(catchError(response => this.handleHttpError(response)))
        )
    );

    constructor() {
        // reducers
        merge(this.portfolioCreated$, this.portfolioUpdated$, this.portfolioDeleted$)
            .pipe(
                startWith(null),
                switchMap(() =>
                    this.http.get<Portfolio[]>(ApiEndpoints.Portfolios).pipe(
                        retry({ count: 2, delay: 5000 }),
                        catchError(response => this.handleHttpError(response))
                    )
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

        this.error$.pipe(takeUntilDestroyed()).subscribe(error =>
            this.state.update(state => ({
                ...state,
                error
            }))
        );
    }

    private handleHttpError(response: HttpErrorResponse): Observable<never> {
        if (response.status === 400 && response.error.title === "Errors.Collection") {
            this.error$.next(response.error.items);
            return EMPTY;
        }

        if (response.status === 400) {
            this.error$.next(response.error.error);
            return EMPTY;
        }

        this.error$.next(response.statusText);
        return EMPTY;
    }
}
