/* eslint-disable @typescript-eslint/no-explicit-any */
import fetch, {
    RequestInfo
} from "node-fetch";
import SysLog from "./SysLog";


export interface Ls10GpsCoordinate {
    results: [
       {
          address_components: [
             {
                long_name: string;
                short_name: string;
                types: string [];
             }
          ];
          formatted_address: string;
          geometry: {
             location: {
                lat: number;
                lng: number;
             };
             location_type: string;
             viewport: {
                northeast: {
                   lat: number;
                   lng: number;
                };
                southwest: {
                   lat: number;
                   lng: number;
                };
             };
          };
          place_id: string;
          plus_code: {
             compound_code: string;
             global_code: string;
          };
          types: string[];
       }
    ];
    status: string;
  }

export async function http(
    request: RequestInfo
  ): Promise<any> {
    const response = await fetch(request);
    const body = await response.json();
    return body;
  }

  export function getGeocodeGPS(): Promise<Ls10GpsCoordinate| undefined> {
    return new Promise ((resolve, reject) => {
        http('https://maps.googleapis.com/maps/api/geocode/json?address=1170%20AMOHAU%20STREETROTORUA&key=AIzaSyCNX7p1LGxZwYP1M2-vD1noKc6d6rpXFXM')
        .then((gpsCoordinate: Ls10GpsCoordinate) => {
          SysLog.info("GPS coordinates: " + JSON.stringify(gpsCoordinate));
          resolve(gpsCoordinate);
        })
        .catch(() => {
            reject(undefined);
        })
    })
  }