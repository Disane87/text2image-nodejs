import path from "path";

export const ENVIRONMENT = process.env.NODE_ENV || "development";
export const WORKDIR = path.join(
  process.cwd(),
  ENVIRONMENT == "development" ? "src" : "."
);

export const EXPRESS_PORT =  3000;
export const WRITE_LOG = true;
export const LOG_DIRECTORY = path.join(WORKDIR, "logs");
