import { nameof } from "../core/utils/nameof";
import { CamelCaseToHeaderPipe } from "./camel-case-to-header.pipe";

type Asset = {
    id: number;
    assetName: string;
    assetCurrency: string;
};

describe("CamelCaseToHeaderPipe", () => {
    it("should transform the property name", () => {
        // arrange
        const pipe = new CamelCaseToHeaderPipe();
        const propertyName = nameof<Asset>("id");

        // act
        const transformed = pipe.transform(propertyName);

        // assert
        expect(transformed).withContext("The pipe should capitalize the propertyName").toBe("Id");
    });

    it("should transform the property name and split", () => {
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
