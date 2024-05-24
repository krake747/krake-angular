import { CamelCaseToHeaderPipe } from "./camel-case-to-header.pipe";

type Asset = {
    id: number;
    assetName: string;
    assetCurrency: string;
};

function nameof<T>(name: keyof T): keyof T {
    return name;
}

describe("CamelCaseToHeaderPipe", () => {
    it("transforms the property name", () => {
        // arrange
        const pipe = new CamelCaseToHeaderPipe();
        const propertyName = nameof<Asset>("id");

        // act
        const transformed = pipe.transform(propertyName);

        // assert
        expect(transformed).withContext("The pipe should capitalize the propertyName").toBe("Id");
    });

    it("transforms and splits the property name", () => {
        // arrange
        const pipe = new CamelCaseToHeaderPipe();
        const propertyName = nameof<Asset>("assetName");

        // act
        const transformed = pipe.transform(propertyName);

        // assert
        expect(transformed)
            .withContext("The pipe should capitalize the propertyName and split in-between capital letters")
            .toBe("Asset Name");
    });
});
