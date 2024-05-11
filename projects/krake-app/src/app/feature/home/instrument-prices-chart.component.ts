import { CurrencyPipe } from "@angular/common";
import { Component, OnChanges, inject, input, viewChild } from "@angular/core";
import { ChartConfiguration, ChartType } from "chart.js";
import { BaseChartDirective } from "ng2-charts";
import { InstrumentPrice } from "./instrument.service";
import { PortfolioInvestment } from "./portfolios.service";

@Component({
    selector: "krake-instrument-prices-chart",
    standalone: true,
    imports: [CurrencyPipe, BaseChartDirective],
    providers: [CurrencyPipe],
    template: `
        <div class="chart-container">
            <canvas baseChart [data]="lineChartData" [options]="lineChartOptions" [type]="lineChartType"></canvas>
        </div>
    `,
    styles: `
        .chart-container {
            position: relative;
            margin: auto;
            width: 48vw;
            height: 41vh;
        }
    `
})
export class InstrumentPricesChartComponent implements OnChanges {
    private readonly currencyPipe = inject(CurrencyPipe);

    chart = viewChild<BaseChartDirective>(BaseChartDirective);
    prices = input<InstrumentPrice[]>();
    investment = input<PortfolioInvestment>();

    constructor() {}

    lineChartType: ChartType = "line";
    lineChartData: ChartConfiguration["data"] = this.generateLineChartData();

    lineChartOptions: ChartConfiguration["options"] = {
        elements: {
            line: {
                tension: 0.5
            }
        },
        scales: {
            y: {
                position: "left",
                title: {
                    display: true,
                    text: "Closing Price"
                },
                ticks: {
                    callback: value => this.currencyPipe.transform(value, this.investment()?.instrumentCurrency)
                }
            }
        }
    };

    private generateLineChartData(): ChartConfiguration["data"] {
        const baseData = (this.prices() ?? []).slice(-100);
        const data = baseData.map(p => p.close);
        const labels = baseData.map(p => p.date);
        const indigo400 = (opacity: number) => `rgba(92, 107, 192, ${opacity})`;
        return {
            datasets: [
                {
                    data: data,
                    label: this.investment()?.instrumentName ?? "",
                    backgroundColor: indigo400(0.2),
                    borderColor: indigo400(0.8),
                    pointBackgroundColor: indigo400(1),
                    pointBorderColor: "#fff",
                    pointHoverBackgroundColor: "#fff",
                    pointHoverBorderColor: indigo400(0.8),
                    fill: "origin"
                }
            ],
            labels: labels
        };
    }

    ngOnChanges() {
        this.lineChartData = this.generateLineChartData();
    }
}
