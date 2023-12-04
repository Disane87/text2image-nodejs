import { ApiKeyMiddleware } from "./api-key.middleware";

describe(`ApiKeyMiddleware`, () => {
    it(`should be defined`, () => {
        expect(new ApiKeyMiddleware()).toBeDefined();
    });
});
