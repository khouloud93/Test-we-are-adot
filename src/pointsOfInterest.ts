import * as fs from 'node:fs';
import csvParser from 'csv-parser';

interface PointOfInterest {
  lat: number;
  lon: number;
  name: string;
}

interface Event {
  lat: number;
  lon: number;
  type: 'impression' | 'click';
}

interface Result {
  lat: number;
  lon: number;
  name: string;
  impressions: number;
  clicks: number;
}
/**
 * function is responsible for processing the events and associating them with the nearest points of interest.
 *  It orchestrates the overall flow of the data processing pipeline
 * @returns  Promise<Record<string, Result>>
 */
async function processEvents(): Promise<Record<string, Result>> {
  const pointsOfInterest = await loadPointsOfInterest();
  const results: Record<string, Result> = {};

  return new Promise((resolve, reject) => {
    fs.createReadStream('data/events.csv')
      .pipe(csvParser())
      .on('data', (row) => {
        const event: Event = {
          lat: parseFloat(row.lat),
          lon: parseFloat(row.lon),
          type: row.event_type as 'impression' | 'click',
        };

        let closestPoint: PointOfInterest | undefined;
        let closestDistance: number = Infinity;

        for (const point of pointsOfInterest) {
          const distance = calculateDistance(event.lat, event.lon, point.lat, point.lon);
          if (distance < closestDistance) {
            closestPoint = point;
            closestDistance = distance;
          }
        }

        if (closestPoint) {
          const pointName = closestPoint.name;
          if (!results[pointName]) {
            results[pointName] = {
              lat: closestPoint.lat,
              lon: closestPoint.lon,
              name: closestPoint.name,
              impressions: 0,
              clicks: 0,
            };
          }

          if (event.type === 'impression') {
            results[pointName].impressions++;
          } else if (event.type === 'click') {
            results[pointName].clicks++;
          }
        }
      })
      .on('end', () => {
        resolve(results);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

/**
 * This function is responsible for loading the points of interest data from the JSON file. 
 * It reads the file and returns an array of PointOfInterest objects.
 * @returns  Promise<PointOfInterest[]>
 */

function loadPointsOfInterest(): Promise<PointOfInterest[]> {
  return new Promise((resolve, reject) => {
    fs.readFile('points-of-interest.json', 'utf8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        const pointsOfInterest = JSON.parse(data) as PointOfInterest[];
        resolve(pointsOfInterest);
      }
    });
  });
}

/**
 * This function calculates the distance between two sets of latitude and longitude coordinates using a mathematical formula. 
 * It returns the calculated distance as a number.
 * @param lat1 
 * @param lon1 
 * @param lat2 
 * @param lon2 
 * @returns 
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const earthRadius = 6371; // Rayon moyen de la Terre en kilomètres

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = earthRadius * c;
  return distance;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}
export { processEvents };
