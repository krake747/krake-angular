import { Component } from "@angular/core";
import { MatToolbarModule } from "@angular/material/toolbar";
import { RouterOutlet } from "@angular/router";

@Component({
    selector: "krake-main-layout",
    standalone: true,
    imports: [RouterOutlet, MatToolbarModule],
    template: `
        <mat-toolbar color="primary" class="mat-elevation-z3">
            <span class="spacer"></span>
            <span>{{ title }}</span>
            <span class="spacer"></span>
        </mat-toolbar>
        <main class="container">
            <router-outlet />
        </main>
    `,
    styles: [
        `
            main {
                &.container {
                    margin: 15px 15px 5px 15px;
                }
            }

            .spacer {
                flex: 1 1 auto;
            }
        `
    ]
})
export class MainLayoutComponent {
    title = "Krake's Finance App";
}
