import { TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { RouterOutlet } from "@angular/router";
import { MainLayoutComponent } from "./main-layout.component";

describe("MainLayoutComponent", () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    it("creates main layout component", () => {
        // arrange
        const fixture = TestBed.createComponent(MainLayoutComponent);

        // assert
        expect(fixture).toBeTruthy();
    });

    it("displays a title in the navigation bar", () => {
        // arrange
        const fixture = TestBed.createComponent(MainLayoutComponent);
        const mainLayoutComponent = fixture.componentInstance;
        const element = fixture.nativeElement as HTMLElement;

        // act
        const nav = element.querySelector("mat-toolbar");
        mainLayoutComponent.title.setTitle("Test App");

        fixture.detectChanges();

        // assert
        expect(nav).withContext("should display a navigation bar").toBeTruthy();
        expect(mainLayoutComponent.title).withContext("should display a title").toBeTruthy();
        expect(mainLayoutComponent.title.getTitle()).withContext("the title should be Test App").toBe("Test App");
    });

    it("creates a router outlet component", () => {
        // arrange
        const fixture = TestBed.createComponent(MainLayoutComponent);

        // act
        const routerOutlet = fixture.debugElement.queryAll(By.directive(RouterOutlet));

        // assert
        expect(routerOutlet).withContext("should contain a RouterOutlet component").toBeTruthy();
    });
});
