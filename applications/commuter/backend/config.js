// @flow

function deprecate(env: Object, oldVar: string, newVar: string) {
  if (env[oldVar]) {
    console.warn(`${oldVar} is deprecated, please use ${newVar}`);
  }
}

// eslint-disable-next-line no-unused-vars
function populateLocalStorageOptions(env): Object {
  let baseDirectory = process.env.COMMUTER_LOCAL_STORAGE_BASEDIRECTORY;

  if (!baseDirectory) {
    baseDirectory = process.cwd();
    console.warn("Running in the current working directory, ", baseDirectory);
  }

  return {
    local: {
      baseDirectory
    }
  };
}

function populateS3Options(env): Object {
  deprecate(env, "COMMUTER_BASEPATH", "COMMUTER_S3_BASE_PREFIX");
  deprecate(env, "COMMUTER_PATH_DELIMITER", "COMMUTER_S3_PATH_DELIMITER");

  if (!env.COMMUTER_BUCKET) {
    throw "S3 Bucket Name Missing";
  }

  const s3PathDelimiter =
    env.COMMUTER_S3_PATH_DELIMITER || env.COMMUTER_PATH_DELIMITER || "/";

  const s3BasePrefix = (
    env.COMMUTER_S3_BASE_PREFIX ||
    env.COMMUTER_BASEPATH || // deprecated
    ""
  )
    // trim off trailing slashes
    .replace(/\/+$/, "");

  const config = {
    s3: {
      params: {
        // required s3 bucket name
        Bucket: env.COMMUTER_BUCKET
      },
      // required key
      accessKeyId: env.COMMUTER_S3_KEY,
      // required secret
      secretAccessKey: env.COMMUTER_S3_SECRET
    },
    s3PathDelimiter,
    s3BasePrefix
  };

  return config;
}

function instantiate() {
  const storageBackend = (
    process.env.COMMUTER_STORAGE_BACKEND || "local"
  ).toLowerCase();

  if (storageBackend !== "local" && storageBackend !== "s3") {
    throw new Error(`Unknown storageBackend ${storageBackend}`);
  }

  let discoveryBackend = process.env.COMMUTER_DISCOVERY_BACKEND || "none";
  // NOTE: The automatic assumption of using elasticsearch could be deprecated
  //       in favor of selecting it here. Not sure which way to go.
  //       Deferring that decision to later!
  if (discoveryBackend === "none" && process.env.COMMUTER_ES_HOST) {
    discoveryBackend = "elasticsearch";
  }

  console.log("CONFIGURED DISCOVERY", discoveryBackend);

  const config = {};

  switch (storageBackend) {
    case "s3":
      config.storage = populateS3Options(process.env);
      break;
    case "local":
    default:
      config.storage = populateLocalStorageOptions(process.env);
  }

  config.storageBackend = storageBackend;

  switch (discoveryBackend) {
    case "elasticsearch":
      config.discovery = {
        elasticsearch: {
          host: process.env.COMMUTER_ES_HOST || "",
          log: "debug"
        }
      };
      config.discoveryBackend = "elasticsearch";
      break;
    default:
      config.discoveryBackend = "none";
  }

  config.nodeEnv = process.env.NODE_ENV || "test";
  config.port = process.env.PORT || process.env.COMMUTER_PORT || 4000;

  return config;
}

module.exports = instantiate();
