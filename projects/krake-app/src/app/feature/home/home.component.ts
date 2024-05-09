import { AsyncPipe } from "@angular/common";
import { Component, inject, signal } from "@angular/core";
import { Portfolio, PortfolioInvestment, PortfolioService } from "./portfolios.service";

import { animate, state, style, transition, trigger } from "@angular/animations";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatTableDataSource, MatTableModule } from "@angular/material/table";
import { map } from "rxjs";
import { CamelCaseToHeaderPipe } from "./camel-case-to-header.pipe";

@Component({
    selector: "krake-home",
    standalone: true,
    imports: [AsyncPipe, CamelCaseToHeaderPipe, MatButtonModule, MatIconModule, MatTableModule],
    template: `
        <div class="container">
            <h1>Portfolios</h1>
            @if (dataSource$ | async; as ds) {
                <table mat-table class="mat-elevation-z3" [dataSource]="ds" multiTemplateDataRows>
                    <ng-container matColumnDef="id">
                        <th mat-header-cell *matHeaderCellDef>#</th>
                        <td mat-cell *matCellDef="let i = dataIndex">{{ i + 1 }}</td>
                    </ng-container>
                    <mat-text-column name="name"></mat-text-column>
                    <mat-text-column name="currency"></mat-text-column>
                    <ng-container matColumnDef="expand">
                        <th mat-header-cell *matHeaderCellDef></th>
                        <td mat-cell *matCellDef="let portfolio">
                            <button mat-icon-button>
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
                                                <th mat-header-cell *matHeaderCellDef>
                                                    {{ column | camelCaseToHeader }}
                                                </th>
                                                <td mat-cell *matCellDef="let investment">
                                                    {{ investment[column] }}
                                                </td>
                                            </ng-container>
                                        }
                                        <tr mat-header-row *matHeaderRowDef="portfolioInvestmentCols"></tr>
                                        <tr mat-row *matRowDef="let investment; columns: portfolioInvestmentCols"></tr>
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
                            expandedIndex.set(i)
                        "
                    ></tr>
                    <tr class="expansion-row" mat-row *matRowDef="let row; columns: ['investments']"></tr>
                </table>
            } @else {
                <p>Loading portfolio data...</p>
            }
        </div>
    `,
    styles: [
        `
            .container {
                padding: 15px;
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
    portfolioCols = ["id", "name", "currency", "expand"];
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
        "quantity"
    ];

    expandedPortfolio = signal<Portfolio | null>(null);
    expandedIndex = signal(0);

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
