import { Component, OnChanges, OnInit, computed, inject, input, output } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { CreatePortfolio, Portfolio, UpdatePortfolio } from "../../portfolios.models";

@Component({
    selector: "krake-portfolio-form",
    standalone: true,
    imports: [ReactiveFormsModule],
    template: `
        <h2>Form for portfolio id {{ portfolio()?.id ?? "New" }}</h2>
        <form class="portfolio-form" [formGroup]="portfolioFormGroup" (ngSubmit)="handleSubmit()">
            <div>
                <label for="name">Name</label>
                <input formControlName="name" />
            </div>
            @if (portfolioFormGroup.get("name")?.dirty && portfolioFormGroup.get("name")?.hasError("required")) {
                <span class="validation validation-error">Name is required.</span>
            }
            <div>
                <label for="currency">Currency</label>
                <input formControlName="currency" />
            </div>
            @if (
                portfolioFormGroup.get("currency")?.dirty && portfolioFormGroup.get("currency")?.hasError("required")
            ) {
                <span class="validation validation-error">Currency is required.</span>
            }
            <button type="submit">Create Portfolio</button>
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
export class PortfolioFormComponent implements OnInit, OnChanges {
    private readonly fb = inject(FormBuilder);
    portfolioFormGroup!: FormGroup;

    isEdit = input.required<boolean>();
    portfolio = input<Portfolio | undefined>();

    portfolioCreated = output<CreatePortfolio>();
    portfolioUpdated = output<UpdatePortfolio>();

    portfolioId = computed(() => this.portfolio()?.id);

    constructor() {}

    ngOnInit(): void {
        this.portfolioFormGroup = this.fb.group({
            name: this.fb.control(this.portfolio()?.name ?? "", Validators.required),
            currency: this.fb.control(this.portfolio()?.currency ?? "", [
                Validators.required,
                Validators.minLength(3),
                Validators.maxLength(3)
            ])
        });
    }

    ngOnChanges(): void {
        console.log(this.isEdit());
        console.log(this.portfolio());
    }

    handleSubmit() {
        console.log(this.isEdit(), this.portfolioFormGroup.getRawValue());
        if (this.portfolioFormGroup.invalid) {
            console.log("invalid form");
            this.portfolioFormGroup.markAllAsTouched();
            return;
        }

        if (this.isEdit()) {
            console.log("Emit Update");
            this.portfolioUpdated.emit({
                portfolioId: this.portfolioId()!,
                data: { ...this.portfolioFormGroup.getRawValue() }
            });
        } else {
            console.log("Not Implemented");
            return;
            // this.portfolioCreated.emit({ ...this.portfolioFormGroup.getRawValue() });
        }
    }
}
