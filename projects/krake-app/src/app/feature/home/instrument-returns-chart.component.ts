import { PercentPipe } from "@angular/common";
import { Component, OnChanges, inject, input, viewChild } from "@angular/core";
import { ChartConfiguration, ChartType, TooltipItem } from "chart.js";
import { BaseChartDirective } from "ng2-charts";
import { InstrumentReturn } from "./instrument.service";
import { PortfolioInvestment } from "./portfolios.service";

@Component({
    selector: "krake-instrument-returns-chart",
    standalone: true,
    imports: [PercentPipe, BaseChartDirective],
    providers: [PercentPipe],
    template: `
        <div class="chart-container">
            <canvas baseChart [data]="barChartData" [options]="barChartOptions" [type]="barChartType"></canvas>
        </div>
    `,
    styles: `
        .chart-container {
            position: relative;
            margin: auto;
            width: 46vw;
            height: 36vh;
        }
    `
})
export class InstrumentReturnsChartComponent implements OnChanges {
    private readonly percentPipe = inject(PercentPipe);

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
                },
                ticks: {
                    callback: value => this.percentPipe.transform(value, "1.0-2")
                }
            }
        },
        plugins: {
            legend: {
                display: true
            },
            tooltip: {
                callbacks: {
                    label: (context: TooltipItem<"bar">) =>
                        `${context.dataset.label}: ${Math.round(context.parsed.y * 10000) / 100}%`
                }
            }
        }
    };

    private generateBarChartData(): ChartConfiguration["data"] {
        const baseData = (this.returns() ?? []).slice(-100);
        const data = baseData.map(r => r.value);
        const labels = baseData.map(r => r.date);
        const indigo400 = (opacity: number) => `rgba(92, 107, 192, ${opacity})`;
        const pink400 = (opacity: number) => `rgba(236, 64, 122, ${opacity})`;
        const backgroundColor = data.map(r => (r < 0 ? pink400(0.8) : indigo400(0.8)));
        return {
            datasets: [
                {
                    data: data,
                    label: this.investment()?.instrumentName ?? "",
                    backgroundColor: backgroundColor,
                    borderColor: backgroundColor,
                    borderWidth: 2,
                    hoverBackgroundColor: "#fff",
                    hoverBorderColor: backgroundColor,
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
