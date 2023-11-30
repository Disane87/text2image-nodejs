import { AuditMiddleware } from "./audit.middleware";

describe(`AuditMiddleware`, () => {
  it(`should be defined`, () => {
    expect(new AuditMiddleware()).toBeDefined();
  });
});
