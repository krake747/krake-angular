import { Component, inject } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatListModule } from "@angular/material/list";
import { Router, RouterModule } from "@angular/router";
import { PortfoliosService } from "./portfolios.service";

@Component({
    selector: "krake-portfolios",
    standalone: true,
    imports: [RouterModule, MatButtonModule, MatListModule, MatCardModule],
    providers: [],
    template: `
        <h2>List Portfolios</h2>
        <mat-list role="list">
            @for (portfolio of portfoliosService.portfolios(); track portfolio.id) {
                <mat-list-item role="listitem">
                    <mat-card class="portfolio__card">
                        <mat-card-content [routerLink]="portfolio.id">
                            {{ portfolio.name }} ({{ portfolio.currency }})
                        </mat-card-content>
                    </mat-card>
                </mat-list-item>
            } @empty {
                Loading portfolios...
            }
        </mat-list>
        <button mat-raised-button color="primary" (click)="router.navigate(['portfolios', 'new'])">New</button>
    `,
    styles: `
        mat-card:hover {
            background: #e8eaf6; /* Indigo 50 */
            cursor: pointer;
        }

        .portfolio__card {
            max-width: 480px;
        }
    `
})
export class PortfoliosComponent {
    readonly router = inject(Router);
    readonly portfoliosService = inject(PortfoliosService);
}
