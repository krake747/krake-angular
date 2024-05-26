import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable, computed, inject, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import {
    EMPTY,
    Observable,
    Subject,
    catchError,
    concatMap,
    map,
    merge,
    mergeMap,
    retry,
    startWith,
    switchMap
} from "rxjs";
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

type PortfoliosCommand = {
    command: "create" | "read" | "update" | "delete" | "clear";
    portfolioId: PortfolioId | null;
};

export interface PortfoliosState {
    portfolios: Portfolio[];
    loaded: boolean;
    lastCommand: PortfoliosCommand;
    error: ErrorResponse[] | ErrorResponse | string | null;
}

@Injectable()
export class PortfoliosService {
    private readonly http = inject(HttpClient);

    // state
    private readonly state = signal<PortfoliosState>({
        portfolios: [],
        loaded: false,
        lastCommand: <PortfoliosCommand>{ command: "read", portfolioId: null },
        error: null
    });

    // selectors
    portfolios = computed(() => this.state().portfolios);
    loaded = computed(() => this.state().loaded);
    lastCommand = computed(() => this.state().lastCommand);
    error = computed(() => this.state().error);

    // sources
    create$ = new Subject<CreatePortfolio>();
    update$ = new Subject<UpdatePortfolio>();
    delete$ = new Subject<DeletePortfolio>();
    clear$ = new Subject();

    private error$ = new Subject<ErrorResponse[] | ErrorResponse | string | null>();

    private portfolioCreated$ = this.create$.pipe(
        concatMap(createPortfolio =>
            this.http.post<PortfolioId>(ApiEndpoints.Portfolios, createPortfolio).pipe(
                catchError(response => this.handleHttpError(response)),
                map(portfolioId => <PortfoliosCommand>{ command: "create", portfolioId })
            )
        )
    );

    private portfolioUpdated$ = this.update$.pipe(
        mergeMap(updatePortfolio =>
            this.http.put(ApiEndpoints.Portfolio(updatePortfolio.portfolioId), updatePortfolio.data).pipe(
                catchError(response => this.handleHttpError(response)),
                map(() => <PortfoliosCommand>{ command: "update", portfolioId: updatePortfolio.portfolioId })
            )
        )
    );

    private portfolioDeleted$ = this.delete$.pipe(
        concatMap(deletePortfolio =>
            this.http.delete(ApiEndpoints.Portfolio(deletePortfolio)).pipe(
                catchError(response => this.handleHttpError(response)),
                map(() => <PortfoliosCommand>{ command: "delete", portfolioId: null })
            )
        )
    );

    private portfolioCleared$ = this.clear$.pipe(map(() => <PortfoliosCommand>{ command: "clear", portfolioId: null }));

    constructor() {
        // reducers
        merge(this.portfolioCreated$, this.portfolioUpdated$, this.portfolioDeleted$, this.portfolioCleared$)
            .pipe(
                startWith(<PortfoliosCommand>{ command: "read", portfolioId: null }),
                switchMap(command =>
                    this.http.get<Portfolio[]>(ApiEndpoints.Portfolios).pipe(
                        retry({ count: 2, delay: 5000 }),
                        catchError(response => this.handleHttpError(response)),
                        map(portfolios => ({ portfolios, command: command }))
                    )
                ),
                takeUntilDestroyed()
            )
            .subscribe({
                next: portfolios =>
                    this.state.update(state => ({
                        ...state,
                        portfolios: portfolios.portfolios,
                        lastCommand: portfolios.command,
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
