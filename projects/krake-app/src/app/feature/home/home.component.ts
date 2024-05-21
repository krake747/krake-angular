import { animate, state, style, transition, trigger } from "@angular/animations";
import { AsyncPipe, JsonPipe, PercentPipe } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { MatTooltipModule } from "@angular/material/tooltip";
import { map } from "rxjs";
import { CamelCaseToHeaderPipe } from "../../ui/camel-case-to-header.pipe";
import { RemoveHeaderPrefixPipe } from "../../ui/remove-header-prefix.pipe";
import { InstrumentPricesChartComponent } from "./instrument-prices-chart.component";
import { InstrumentReturnsChartComponent } from "./instrument-returns-chart.component";
import { InstrumentService } from "./instrument.service";
import { Portfolio, PortfolioInvestment, PortfolioService } from "./portfolios.service";

@Component({
    selector: "krake-home",
    standalone: true,
    imports: [
        AsyncPipe,
        PercentPipe,
        JsonPipe,
        CamelCaseToHeaderPipe,
        RemoveHeaderPrefixPipe,
        InstrumentPricesChartComponent,
        InstrumentReturnsChartComponent,
        MatButtonModule,
        MatIconModule,
        MatTableModule,
        MatTooltipModule
    ],
    template: `
        <div class="container">
            <div class="top">
                <h1>Portfolios</h1>
                @if (dataSource$ | async; as ds) {
                    <table mat-table class="mat-elevation-z3" [dataSource]="ds" multiTemplateDataRows>
                        <ng-container matColumnDef="id">
                            <th mat-header-cell *matHeaderCellDef>#</th>
                            <td mat-cell *matCellDef="let i = dataIndex">{{ i + 1 }}</td>
                        </ng-container>
                        <mat-text-column name="name"></mat-text-column>
                        <mat-text-column name="currency"></mat-text-column>
                        <ng-container matColumnDef="totalCost">
                            <th mat-header-cell *matHeaderCellDef>{{ "totalCost" | camelCaseToHeader }}</th>
                            <td mat-cell *matCellDef="let portfolio">
                                {{ portfolio.totalCost }}
                            </td>
                        </ng-container>
                        <ng-container matColumnDef="totalValue">
                            <th mat-header-cell *matHeaderCellDef>{{ "totalValue" | camelCaseToHeader }}</th>
                            <td mat-cell *matCellDef="let portfolio">
                                {{ portfolio.totalValue }}
                            </td>
                        </ng-container>
                        <ng-container matColumnDef="expand">
                            <th mat-header-cell *matHeaderCellDef></th>
                            <td mat-cell *matCellDef="let portfolio">
                                <button
                                    mat-icon-button
                                    #tooltip="matTooltip"
                                    [matTooltip]="expandedPortfolio() === portfolio ? 'Close' : 'Open positions'"
                                    matTooltipPosition="right"
                                >
                                    @if (expandedPortfolio() === portfolio) {
                                        <mat-icon>keyboard_arrow_up</mat-icon>
                                    } @else {
                                        <mat-icon>keyboard_arrow_down</mat-icon>
                                    }
                                </button>
                            </td>
                        </ng-container>
                        <ng-container matColumnDef="investments">
                            <td mat-cell *matCellDef="let portfolio" [attr.colspan]="portfolioCols.length">
                                <div
                                    class="expansion-item"
                                    [@portfolioExpand]="expandedPortfolio() === portfolio ? 'expanded' : 'collapsed'"
                                >
                                    @if (expandedPortfolio() !== null) {
                                        <table mat-table [dataSource]="ds.data[expandedIndex()].investments">
                                            @for (column of portfolioInvestmentCols; track $index) {
                                                <ng-container matColumnDef="{{ column }}">
                                                    @switch (column) {
                                                        @case ("percentageGain") {
                                                            <th mat-header-cell *matHeaderCellDef>{{ "Gain %" }}</th>
                                                            <td mat-cell *matCellDef="let investment">
                                                                {{ investment[column] | percent: "1.0-2" }}
                                                            </td>
                                                        }
                                                        @default {
                                                            <th mat-header-cell *matHeaderCellDef>
                                                                {{
                                                                    column
                                                                        | removeHeaderPrefix: "instrument"
                                                                        | camelCaseToHeader
                                                                }}
                                                            </th>
                                                            <td mat-cell *matCellDef="let investment">
                                                                {{ investment[column] }}
                                                            </td>
                                                        }
                                                    }
                                                </ng-container>
                                            }
                                            <tr mat-header-row *matHeaderRowDef="portfolioInvestmentCols"></tr>
                                            <tr
                                                mat-row
                                                *matRowDef="let investment; columns: portfolioInvestmentCols"
                                                #tooltip="matTooltip"
                                                matTooltipShowDelay="1000"
                                                [matTooltip]="
                                                    expandedInvestment() === null
                                                        ? 'Open charts by click'
                                                        : expandedInvestment()?.instrumentId !== investment.instrumentId
                                                          ? 'Switch charts by click'
                                                          : 'Close charts by click'
                                                "
                                                matTooltipPosition="below"
                                                (click)="
                                                    expandedInvestment.set(
                                                        expandedInvestment() === investment ? null : investment
                                                    );
                                                    instrumentService.instrumentClicked$.next(
                                                        expandedInvestment()?.instrumentId ?? null
                                                    )
                                                "
                                            ></tr>
                                        </table>
                                    }
                                </div>
                            </td>
                        </ng-container>
                        <tr mat-header-row *matHeaderRowDef="portfolioCols"></tr>
                        <tr
                            mat-row
                            *matRowDef="let portfolio; let i = dataIndex; columns: portfolioCols"
                            (click)="
                                expandedPortfolio.set(expandedPortfolio() === portfolio ? null : portfolio);
                                expandedIndex.set(i);
                                expandedInvestment.set(null)
                            "
                        ></tr>
                        <tr class="expansion-row" mat-row *matRowDef="let row; columns: ['investments']"></tr>
                    </table>
                } @else {
                    <p>Loading portfolio data...</p>
                }
            </div>
            @if (expandedPortfolio() !== null && expandedInvestment() !== null) {
                <div class="left">
                    <krake-instrument-prices-chart
                        [investment]="expandedInvestment()!"
                        [prices]="instrumentService.prices()"
                    />
                </div>
                <div class="right">
                    <krake-instrument-returns-chart
                        [investment]="expandedInvestment()!"
                        [returns]="instrumentService.returns()"
                    />
                </div>
            }
        </div>
    `,
    styles: [
        `
            .container {
                display: grid;
                grid-template-columns: auto auto;
                grid-template-rows: auto auto;

                & .top {
                    grid-column-start: 1;
                    grid-column-end: 3;
                    grid-row-start: 1;
                    grid-row-end: 2;
                    padding-bottom: 16px;
                }

                & .left {
                    grid-column-start: 1;
                    grid-column-end: 2;
                }

                & .right {
                    grid-column-start: 2;
                    grid-column-end: 3;
                }
            }

            tr {
                &.expansion-row {
                    height: 0;
                }

                &.expansion-item {
                    overflow: hidden;
                    display: flex;
                }

                &:not(.expansion-row):hover {
                    background: #e8eaf6; /* Indigo 50 */
                }

                &:not(.expansion-row):active {
                    background: #fce4ec; /* Pink 50 */
                }
            }
        `
    ],
    animations: [
        trigger("portfolioExpand", [
            state("collapsed", style({ height: "0px", minHeight: "0" })),
            state("expanded", style({ height: "*" })),
            transition("expanded <=> collapsed", animate("225ms cubic-bezier(0.4, 0.0, 0.2, 1)"))
        ])
    ]
})
export class HomeComponent {
    readonly portfolioService = inject(PortfolioService);
    readonly instrumentService = inject(InstrumentService);
    portfolioCols = ["id", "name", "currency", "totalCost", "totalValue", "expand"];
    portfolioInvestmentCols = [
        "instrumentName",
        "instrumentCurrency",
        "instrumentCountry",
        "instrumentMic",
        "instrumentSector",
        "instrumentSymbol",
        "instrumentIsin",
        "purchaseDate",
        "purchasePrice",
        "quantity",
        "latestDate",
        "latestPrice",
        "gain",
        "percentageGain"
    ];

    expandedPortfolio = signal<Portfolio | null>(null);
    expandedIndex = signal(0);
    expandedInvestment = signal<PortfolioInvestment | null>(null);

    dataSource$ = inject(PortfolioService)
        .listPortfoliosWithInvestments()
        .pipe(
            map(
                pfs =>
                    new MatTableDataSource(
                        pfs.map(p => ({
                            ...p,
                            investments: new MatTableDataSource<PortfolioInvestment>(p.investments)
                        }))
                    )
            )
        );
}
