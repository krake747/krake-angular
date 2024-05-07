import { Component, isDevMode } from "@angular/core";
import { environment } from "../environments/environment.development";
import { MainLayoutComponent } from "./layout/main-layout/main-layout.component";

@Component({
    selector: "krake-root",
    standalone: true,
    imports: [MainLayoutComponent],
    template: `
        <krake-main-layout />
    `,
    styles: []
})
export class AppComponent {
    constructor() {
        console.log(isDevMode() ? "Development API url!" : "Production API url!", `${environment.apiUrl}`);
    }
}
