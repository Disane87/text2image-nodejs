import { Express } from "express";

export const MiddleWares = (app: Express) => {
  app.use((req, res, next) => {
    const apiKeyQS = req.query.apiKey;
    const apiKeyEnv = process.env.API_KEY;

    if (apiKeyQS !== apiKeyEnv && process.env.NODE_ENV !== "development") {
      res
        .status(402)
        .send("⚠️ Invalid API key. Please provide a valid API key. ");
      return;
    }
    next();
  });

  //   app.use((err, _req, res, _next) => {
  //     console.error(err.stack);
  //     res.status(500).send("Something broke!");
  //   });
};
