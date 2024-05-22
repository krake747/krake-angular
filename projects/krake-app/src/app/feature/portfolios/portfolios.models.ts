export interface Portfolio {
    id: string;
    name: string;
    currency: string;
}

export type PortfolioId = Portfolio["id"];

export type CreatePortfolio = Omit<Portfolio, "id">;

export type UpdatePortfolio = { portfolioId: PortfolioId; data: Omit<Portfolio, "id"> };
