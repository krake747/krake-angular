import { Component, inject } from "@angular/core";
import { Router, RouterModule } from "@angular/router";
import { PortfoliosService } from "./portfolios.service";

@Component({
    selector: "krake-portfolios",
    standalone: true,
    imports: [RouterModule],
    providers: [],
    template: `
        <h2>List Portfolios</h2>
        <ul>
            @for (portfolio of portfoliosService.portfolios(); track portfolio.id) {
                <li>
                    <div>{{ portfolio.name }} ({{ portfolio.currency }})</div>
                    <button (click)="router.navigate(['portfolios', portfolio.id])">Update</button>
                </li>
            } @empty {
                Loading portfolios...
            }
        </ul>
        <button (click)="router.navigate(['portfolios', 'new'])">New</button>
    `,
    styles: ``
})
export class PortfoliosComponent {
    readonly router = inject(Router);
    readonly portfoliosService = inject(PortfoliosService);
}
