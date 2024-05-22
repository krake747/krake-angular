import { Routes } from "@angular/router";
import { PortfoliosService } from "./portfolios.service";

export default <Routes>[
    {
        path: "",
        providers: [PortfoliosService],
        children: [
            {
                path: "",
                loadComponent: () => import("./portfolios.component").then(m => m.PortfoliosComponent)
            },
            {
                path: "new",
                loadComponent: () =>
                    import("./portfolio-single/portfolio-single.component").then(m => m.PortfolioSingleComponent),
                data: { isEdit: false }
            },
            {
                path: ":portfolioId",
                loadComponent: () =>
                    import("./portfolio-single/portfolio-single.component").then(m => m.PortfolioSingleComponent),
                data: { isEdit: true }
            },
            {
                path: "**",
                pathMatch: "full",
                redirectTo: ""
            }
        ]
    }
];
