import { nameof } from "../core/utils/nameof";
import { RemoveHeaderPrefixPipe } from "./remove-header-prefix.pipe";

type Asset = {
    assetName: string;
    assetCurrency: string;
};

describe("RemoveHeaderPrefixPipe", () => {
    it("transforms the property name", () => {
        // arrange
        const pipe = new RemoveHeaderPrefixPipe();
        const prefix = "asset";
        const propertyName = nameof<Asset>("assetName");

        // act
        const transformed = pipe.transform(propertyName, prefix);

        // assert
        expect(transformed).withContext("The pipe should remove the prefix from the propertyName").toBe("Name");
    });

    it("does not transform the property name", () => {
        // arrange
        const pipe = new RemoveHeaderPrefixPipe();
        const prefix = "assets";
        const propertyName = nameof<Asset>("assetName");

        // act
        const transformed = pipe.transform(propertyName, prefix);

        // assert
        expect(transformed)
            .withContext("The pipe should not remove the prefix from the propertyName")
            .toBe("assetName");
    });
});
