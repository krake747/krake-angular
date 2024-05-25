import { Component, inject } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatListModule } from "@angular/material/list";
import { Router, RouterModule } from "@angular/router";
import { PortfoliosService } from "./portfolios.service";

@Component({
    selector: "krake-portfolios",
    standalone: true,
    imports: [RouterModule, MatButtonModule, MatListModule],
    providers: [],
    template: `
        <h2>List Portfolios</h2>
        <mat-list role="list">
            @for (portfolio of portfoliosService.portfolios(); track portfolio.id) {
                <mat-list-item role="listitem">
                    <span [routerLink]="portfolio.id">{{ portfolio.name }} ({{ portfolio.currency }})</span>
                </mat-list-item>
            } @empty {
                Loading portfolios...
            }
        </mat-list>
        <button mat-raised-button color="primary" (click)="router.navigate(['portfolios', 'new'])">New</button>
    `,
    styles: `
        mat-list-item:hover {
            background: #e8eaf6; /* Indigo 50 */
            cursor: pointer;
        }
    `
})
export class PortfoliosComponent {
    readonly router = inject(Router);
    readonly portfoliosService = inject(PortfoliosService);
}
