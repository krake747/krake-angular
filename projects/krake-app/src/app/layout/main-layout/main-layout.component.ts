import { BreakpointObserver, Breakpoints } from "@angular/cdk/layout";
import { AsyncPipe } from "@angular/common";
import { Component, inject } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatListModule } from "@angular/material/list";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatToolbarModule } from "@angular/material/toolbar";
import { Meta, Title } from "@angular/platform-browser";
import { RouterLink, RouterOutlet } from "@angular/router";
import { Observable, map, shareReplay } from "rxjs";

@Component({
    selector: "krake-main-layout",
    standalone: true,
    imports: [
        RouterOutlet,
        RouterLink,
        AsyncPipe,
        MatButtonModule,
        MatToolbarModule,
        MatListModule,
        MatIconModule,
        MatSidenavModule
    ],
    template: `
        <mat-sidenav-container class="sidenav-container">
            <mat-sidenav
                #drawer
                class="sidenav"
                fixedInViewport
                [attr.role]="(isHandset$ | async) ? 'dialog' : 'navigation'"
                [mode]="(isHandset$ | async) ? 'over' : 'side'"
                [opened]="(isHandset$ | async) === false"
            >
                <mat-toolbar>Menu</mat-toolbar>
                <mat-nav-list>
                    <a mat-list-item routerLink="home">Home</a>
                    <a mat-list-item routerLink="portfolios">Portfolios</a>
                </mat-nav-list>
            </mat-sidenav>
            <mat-sidenav-content>
                <mat-toolbar color="primary" class="mat-elevation-z3">
                    @if (isHandset$ | async) {
                        <button type="button" aria-label="Toggle sidenav" mat-icon-button (click)="drawer.toggle()">
                            <mat-icon aria-label="Side nav toggle icon">menu</mat-icon>
                        </button>
                    }
                    <span class="spacer"></span>
                    <span id="title">{{ title.getTitle() }}</span>
                    <span class="spacer"></span>
                </mat-toolbar>
                <main>
                    <router-outlet />
                </main>
            </mat-sidenav-content>
        </mat-sidenav-container>
    `,
    styles: [
        `
            .sidenav-container {
                height: 100%;
            }

            .sidenav {
                width: 120px;
            }

            .sidenav .mat-toolbar {
                background: inherit;
            }

            .mat-toolbar.mat-primary {
                position: sticky;
                top: 0;
                z-index: 1;
            }

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
    private readonly breakpointObserver = inject(BreakpointObserver);
    readonly title = inject(Title);
    readonly meta = inject(Meta);

    isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset).pipe(
        map(result => result.matches),
        shareReplay()
    );

    constructor() {
        this.title.setTitle("Krake's Finance App");
        this.meta.addTag({ name: "author", content: "Krake747" });
    }
}
