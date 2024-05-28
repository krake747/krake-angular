import { Component, OnInit, computed, inject, input, output } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import {
    FormResetEvent,
    FormSubmittedEvent,
    NonNullableFormBuilder,
    PristineChangeEvent,
    ReactiveFormsModule,
    StatusChangeEvent,
    TouchedChangeEvent,
    Validators,
    ValueChangeEvent
} from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { CreatePortfolio, DeletePortfolio, Portfolio, UpdatePortfolio } from "../../portfolios.models";

@Component({
    selector: "krake-portfolio-form",
    standalone: true,
    imports: [ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatInputModule],
    template: `
        <h2>Form for portfolio id {{ portfolio()?.id ?? "New" }}</h2>
        <form class="portfolio-form" [formGroup]="portfolioFormGroup" (ngSubmit)="handleSubmit()">
            <p>
                <mat-form-field appearance="fill">
                    <mat-label for="name">Name</mat-label>
                    <input id="name" matInput formControlName="name" />
                </mat-form-field>
            </p>
            @if (portfolioFormGroup.get("name")?.dirty && portfolioFormGroup.get("name")?.hasError("required")) {
                <span class="validation validation-error">Name is required.</span>
            }
            <p>
                <mat-form-field appearance="fill">
                    <mat-label for="currency">Currency</mat-label>
                    <input id="currency" matInput formControlName="currency" />
                </mat-form-field>
            </p>
            @if (
                portfolioFormGroup.get("currency")?.dirty && portfolioFormGroup.get("currency")?.hasError("required")
            ) {
                <span class="validation validation-error">Currency is required.</span>
            }
            <button type="submit" mat-raised-button color="primary" [disabled]="portfolioFormGroup.untouched">
                {{ isEdit() ? "Update Portfolio" : "Create Portfolio" }}
            </button>
            @if (isEdit()) {
                <button mat-raised-button color="warn" (click)="handleDelete()">Delete</button>
            }
            @if (portfolioFormGroup.touched || isEdit()) {
                <button mat-raised-button color="accent" (click)="portfolioFormGroup.reset()">Reset</button>
            }
            <button mat-raised-button color="accent" (click)="portfolioFormGroup.reset(); returnBack.emit({})">
                Back
            </button>
        </form>
    `,
    styles: `
        .portfolio-form {
            & .validation {
                border: red 1px solid;
                color: #fff;
                font-size: 0.75em;
                line-height: 1;

                &.validation-error {
                    background: #b52d30;
                }

                &.validation-info {
                    background: #468f92;
                }
            }
        }
    `
})
export class PortfolioFormComponent implements OnInit {
    private readonly fb = inject(NonNullableFormBuilder);
    portfolioFormGroup = this.fb.group({
        name: this.fb.control("", Validators.required),
        currency: this.fb.control("", [Validators.required])
    });

    isEdit = input.required<boolean>();
    portfolio = input<Portfolio | undefined>();

    readonly portfolioCreated = output<CreatePortfolio>();
    readonly portfolioUpdated = output<UpdatePortfolio>();
    readonly portfolioDeleted = output<DeletePortfolio>();
    readonly returnBack = output<unknown>();

    portfolioId = computed(() => this.portfolio()?.id);

    constructor() {
        this.portfolioFormGroup.events.pipe(takeUntilDestroyed()).subscribe(event => {
            if (event instanceof TouchedChangeEvent) {
                console.log("Touched: ", event.touched);
            } else if (event instanceof PristineChangeEvent) {
                console.log("Pristine: ", event.pristine);
            } else if (event instanceof StatusChangeEvent) {
                console.log("Status: ", event.status);
            } else if (event instanceof ValueChangeEvent) {
                console.log("Value: ", event.value);
            } else if (event instanceof FormResetEvent) {
                console.log("Form reset");
            } else if (event instanceof FormSubmittedEvent) {
                console.log("Form submitted");
            }
        });
    }

    ngOnInit(): void {
        this.portfolioFormGroup.setValue({
            name: this.portfolio()?.name ?? "",
            currency: this.portfolio()?.currency ?? ""
        });
    }

    handleSubmit(): void {
        if (this.portfolioFormGroup.invalid) {
            this.portfolioFormGroup.markAllAsTouched();
            return;
        }

        if (this.isEdit()) {
            this.portfolioUpdated.emit({
                portfolioId: this.portfolioId()!,
                data: { ...this.portfolioFormGroup.getRawValue() }
            });
        } else {
            this.portfolioCreated.emit({ ...this.portfolioFormGroup.getRawValue() });
        }
    }

    public handleDelete(): void {
        if (confirm(`Really delete ${this.portfolio()!.name}?`)) {
            this.portfolioDeleted.emit(this.portfolioId()!);
        }
    }
}
