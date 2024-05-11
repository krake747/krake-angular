import { provideHttpClient } from "@angular/common/http";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
import {
    Routes,
    provideRouter,
    withComponentInputBinding,
    withInMemoryScrolling,
    withRouterConfig
} from "@angular/router";
import { provideCharts, withDefaultRegisterables } from "ng2-charts";

export interface CoreOptions {
    routes: Routes;
}

export function provideCore({ routes }: CoreOptions) {
    return [
        provideAnimationsAsync(),
        provideRouter(
            routes,
            withRouterConfig({
                onSameUrlNavigation: "reload"
            }),
            withComponentInputBinding(),
            withInMemoryScrolling({
                anchorScrolling: "enabled",
                scrollPositionRestoration: "enabled"
            })
        ),
        provideHttpClient(),

        // 3rd party
        // ng2-charts
        provideCharts(withDefaultRegisterables())
    ];
}
