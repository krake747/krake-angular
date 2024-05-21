import { TestBed } from "@angular/core/testing";
import { MainLayoutComponent } from "./main-layout.component";

describe("MainLayoutComponent", () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    it("should display a navigation bar with a title", () => {
        // arrange
        const fixture = TestBed.createComponent(MainLayoutComponent);
        const mainLayoutComponent = fixture.componentInstance;

        // act
        mainLayoutComponent.title = "My Test App";

        fixture.detectChanges();

        const element = fixture.nativeElement;
        const title = element.querySelector("#title");

        // assert
        expect(title).withContext("You need a title for the app name").not.toBeNull();
        expect(title.textContent)
            .withContext("The span element with id title should contain the title parameter value")
            .toContain("My Test App");
    });
});
