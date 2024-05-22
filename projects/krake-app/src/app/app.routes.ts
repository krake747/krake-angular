import { Routes } from "@angular/router";

export const routes: Routes = [
    {
        path: "",
        pathMatch: "full",
        redirectTo: "home"
    },
    {
        path: "home",
        loadChildren: () => import("./feature/home/home.routes")
    },
    {
        path: "portfolios",
        loadChildren: () => import("./feature/portfolios/portfolios.routes")
    },
    {
        path: "**",
        redirectTo: "home"
    }
];
