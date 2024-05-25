import { Component, OnInit, computed, inject, input, output } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
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
                    <input matInput formControlName="name" />
                </mat-form-field>
            </p>
            @if (portfolioFormGroup.get("name")?.dirty && portfolioFormGroup.get("name")?.hasError("required")) {
                <span class="validation validation-error">Name is required.</span>
            }
            <p>
                <mat-form-field appearance="fill">
                    <mat-label for="currency">Currency</mat-label>
                    <input matInput formControlName="currency" />
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
    private readonly fb = inject(FormBuilder);
    portfolioFormGroup!: FormGroup;

    isEdit = input.required<boolean>();
    portfolio = input<Portfolio | undefined>();

    readonly portfolioCreated = output<CreatePortfolio>();
    readonly portfolioUpdated = output<UpdatePortfolio>();
    readonly portfolioDeleted = output<DeletePortfolio>();

    portfolioId = computed(() => this.portfolio()?.id);

    constructor() {}

    ngOnInit(): void {
        this.portfolioFormGroup = this.fb.group({
            name: this.fb.control(this.portfolio()?.name ?? "", Validators.required),
            currency: this.fb.control(this.portfolio()?.currency ?? "", [Validators.required])
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
