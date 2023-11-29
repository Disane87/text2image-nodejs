import Logger from "./logger.js";

export const MiddleWares = {
  apiKey: (req, res, next) => {
    const apiKeyQS = req.query.apiKey;
    const apiKeyEnv = process.env.API_KEY;

    if (apiKeyQS !== apiKeyEnv && process.env.NODE_ENV !== "development") {
      res
        .status(402)
        .send("⚠️ Invalid API key. Please provide a valid API key. ");
      return;
    }
    next();
  },
  error: (err, _req, res, _next) => {
    console.error(err.stack);
    res.status(500).send("Something broke! 🔥");
  },
  audit: (req, res, next) => {
    const { ip, hostname, query } = req;
    Logger.debug(
      `Request received: [${ip} | ${hostname}] ${JSON.stringify(query)}`,
      "Request"
    );
    // Logger.debug(`Response: ${JSON.stringify(res)}`, "Response");
    next();
  },
};
