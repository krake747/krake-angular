import { Component, OnChanges, input, viewChild } from "@angular/core";
import { ChartConfiguration, ChartType } from "chart.js";
import { BaseChartDirective } from "ng2-charts";
import { InstrumentPrice } from "./instrument.service";
import { PortfolioInvestment } from "./portfolios.service";

@Component({
    selector: "krake-instrument-prices-chart",
    standalone: true,
    imports: [BaseChartDirective],
    template: `
        <canvas baseChart [data]="lineChartData" [options]="lineChartOptions" [type]="lineChartType"></canvas>
    `,
    styles: ``
})
export class InstrumentPricesChartComponent implements OnChanges {
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
                }
            }
        }
    };

    private generateLineChartData(): ChartConfiguration["data"] {
        const baseData = (this.prices() ?? []).slice(-100);
        const data = baseData.map(p => p.close);
        const labels = baseData.map(p => p.date);
        const indigo50 = (opacity: number) => `rgba(92, 107, 192, ${opacity})`;
        return {
            datasets: [
                {
                    data: data,
                    label: this.investment()?.instrumentName ?? "",
                    backgroundColor: indigo50(0.2),
                    borderColor: indigo50(0.8),
                    pointBackgroundColor: indigo50(1),
                    pointBorderColor: "#fff",
                    pointHoverBackgroundColor: "#fff",
                    pointHoverBorderColor: indigo50(0.8),
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
