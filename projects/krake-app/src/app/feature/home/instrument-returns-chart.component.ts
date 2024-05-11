import { Component, OnChanges, input, viewChild } from "@angular/core";
import { ChartConfiguration, ChartType } from "chart.js";
import { BaseChartDirective } from "ng2-charts";
import { InstrumentReturn } from "./instrument.service";
import { PortfolioInvestment } from "./portfolios.service";

@Component({
    selector: "krake-instrument-returns-chart",
    standalone: true,
    imports: [BaseChartDirective],
    template: `
        <canvas baseChart [data]="barChartData" [options]="barChartOptions" [type]="barChartType"></canvas>
    `,
    styles: ``
})
export class InstrumentReturnsChartComponent implements OnChanges {
    chart = viewChild<BaseChartDirective>(BaseChartDirective);
    returns = input<InstrumentReturn[]>();
    investment = input<PortfolioInvestment>();

    constructor() {}

    barChartType: ChartType = "bar";
    barChartData: ChartConfiguration["data"] = this.generateBarChartData();

    barChartOptions: ChartConfiguration["options"] = {
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
                    text: "Simple Returns"
                }
            }
        }
    };

    private generateBarChartData(): ChartConfiguration["data"] {
        const baseData = (this.returns() ?? []).slice(-100);
        const data = baseData.map(r => r.value);
        const labels = baseData.map(r => r.date);
        const indigo50 = (opacity: number) => `rgba(92, 107, 192, ${opacity})`;
        return {
            datasets: [
                {
                    data: data,
                    label: this.investment()?.instrumentName ?? "",
                    backgroundColor: indigo50(0.8),
                    borderColor: indigo50(0.8),
                    borderWidth: 2,
                    hoverBackgroundColor: "#fff",
                    hoverBorderColor: indigo50(0.8),
                    fill: "origin"
                }
            ],
            labels: labels
        };
    }

    ngOnChanges() {
        this.barChartData = this.generateBarChartData();
    }
}
