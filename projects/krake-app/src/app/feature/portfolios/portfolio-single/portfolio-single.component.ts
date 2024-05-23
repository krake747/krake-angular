import { Component, computed, inject, input } from "@angular/core";
import { Router } from "@angular/router";
import { PortfolioId } from "../portfolios.models";
import { PortfoliosService } from "../portfolios.service";
import { PortfolioFormComponent } from "../ui/portfolio-form/portfolio-form.component";

@Component({
    selector: "krake-portfolio-single",
    standalone: true,
    imports: [PortfolioFormComponent],
    template: `
        <h2>Single Portfolio</h2>
        <div>
            <krake-portfolio-form
                [isEdit]="isEdit()"
                [portfolio]="portfolio()"
                (portfolioUpdated)="portfoliosService.update$.next($event); router.navigate(['portfolios'])"
                (portfolioCreated)="portfoliosService.create$.next($event); router.navigate(['portfolios'])"
                (portfolioDeleted)="portfoliosService.delete$.next($event); router.navigate(['portfolios'])"
            />
        </div>
    `,
    styles: ``
})
export class PortfolioSingleComponent {
    readonly router = inject(Router);
    readonly portfoliosService = inject(PortfoliosService);

    // route bindings
    portfolioId = input.required<PortfolioId>();
    isEdit = input.required<boolean>();

    // selectors
    portfolio = computed(() => this.portfoliosService.portfolios().find(p => p.id === this.portfolioId()));

    constructor() {
        // effects
    }
}
