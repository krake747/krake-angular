export interface Portfolio {
    id: string;
    name: string;
    currency: string;
}

export type PortfolioId = Portfolio["id"];

export type CreatePortfolio = Omit<Portfolio, "id">;

export type UpdatePortfolio = { portfolioId: PortfolioId; data: Omit<Portfolio, "id"> };

export type DeletePortfolio = Portfolio["id"];

export interface ErrorResponse {
    propertyName: string;
    attemptedValue: string;
    code: string;
    message: string;
    type: string;
}
