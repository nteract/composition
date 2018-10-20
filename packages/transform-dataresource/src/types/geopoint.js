import lodash from "lodash";
import { ERROR } from "./error";

// Module API

export function castGeopoint(format, value) {
  let lon, lat;
  try {
    if (format === "default") {
      if (lodash.isString(value)) {
        [lon, lat] = value.split(",");
        lon = lon.trim();
        lat = lat.trim();
      } else if (lodash.isArray(value)) {
        [lon, lat] = value;
      }
    } else if (format === "array") {
      if (lodash.isString(value)) {
        value = JSON.parse(value);
      }
      [lon, lat] = value;
    } else if (format === "object") {
      if (lodash.isString(value)) {
        value = JSON.parse(value);
      }
      lon = value.lon;
      lat = value.lat;
    }
    lon = lodash.toNumber(lon);
    lat = lodash.toNumber(lat);
  } catch (error) {
    return ERROR;
  }
  if (lodash.isNaN(lon) || lon > 180 || lon < -180) {
    return ERROR;
  }
  if (lodash.isNaN(lat) || lat > 90 || lat < -90) {
    return ERROR;
  }
  return [lon, lat];
}
