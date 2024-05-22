import { Component, inject } from "@angular/core";
import { MatToolbarModule } from "@angular/material/toolbar";
import { Meta, Title } from "@angular/platform-browser";
import { RouterOutlet } from "@angular/router";

@Component({
    selector: "krake-main-layout",
    standalone: true,
    imports: [RouterOutlet, MatToolbarModule],
    template: `
        <mat-toolbar color="primary" class="mat-elevation-z3">
            <span class="spacer"></span>
            <span id="title">{{ title.getTitle() }}</span>
            <span class="spacer"></span>
        </mat-toolbar>
        <main>
            <router-outlet />
        </main>
    `,
    styles: [
        `
            main {
                margin: 16px 16px 8px 16px;
            }

            .spacer {
                flex: 1 1 auto;
            }
        `
    ]
})
export class MainLayoutComponent {
    readonly title = inject(Title);
    readonly meta = inject(Meta);

    constructor() {
        this.title.setTitle("Krake's Finance App");
        this.meta.addTag({ name: "author", content: "Krake747" });
    }
}
