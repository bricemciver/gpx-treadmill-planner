import type { TrackPoint, Segment, GPXData } from "./store";

// Haversine formula to calculate distance between two lat/lon points
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Earth's radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// Interpolate missing elevation values
function interpolateElevations(
  points: { lat: number; lon: number; ele: number | null }[],
): TrackPoint[] {
  const result: TrackPoint[] = [];

  for (let i = 0; i < points.length; i++) {
    const point = points[i];
    let ele = point.ele;

    if (ele === null) {
      // Find previous and next valid elevations
      let prevIdx = i - 1;
      let nextIdx = i + 1;

      while (prevIdx >= 0 && points[prevIdx].ele === null) prevIdx--;
      while (nextIdx < points.length && points[nextIdx].ele === null) nextIdx++;

      const prevEle = prevIdx >= 0 ? points[prevIdx].ele : null;
      const nextEle = nextIdx < points.length ? points[nextIdx].ele : null;

      if (prevEle !== null && nextEle !== null) {
        // Linear interpolation
        const ratio = (i - prevIdx) / (nextIdx - prevIdx);
        ele = prevEle + (nextEle - prevEle) * ratio;
      } else if (prevEle !== null) {
        ele = prevEle;
      } else if (nextEle !== null) {
        ele = nextEle;
      } else {
        ele = 0;
      }
    }

    result.push({
      lat: point.lat,
      lon: point.lon,
      ele: ele,
      dist_m: 0,
    });
  }

  return result;
}

export interface ParseResult {
  success: true;
  data: GPXData;
}

export interface ParseError {
  success: false;
  error: string;
}

export function parseGPX(xmlString: string): ParseResult | ParseError {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlString, "application/xml");

    // Check for parse errors
    const parseError = doc.querySelector("parsererror");
    if (parseError) {
      return { success: false, error: "File could not be read as GPX" };
    }

    // Extract all trackpoints
    const trkpts = doc.querySelectorAll("trkpt");
    if (trkpts.length === 0) {
      return { success: false, error: "GPX file appears empty" };
    }

    // Parse trackpoints
    const rawPoints: { lat: number; lon: number; ele: number | null }[] = [];
    let hasAnyElevation = false;

    trkpts.forEach((trkpt) => {
      const lat = Number.parseFloat(trkpt.getAttribute("lat") || "");
      const lon = Number.parseFloat(trkpt.getAttribute("lon") || "");
      const eleEl = trkpt.querySelector("ele");
      const ele = eleEl ? Number.parseFloat(eleEl.textContent || "") : null;

      if (!Number.isNaN(lat) && !Number.isNaN(lon)) {
        if (ele !== null && !Number.isNaN(ele)) {
          hasAnyElevation = true;
        }
        rawPoints.push({ lat, lon, ele: ele !== null && !Number.isNaN(ele) ? ele : null });
      }
    });

    if (rawPoints.length === 0) {
      return { success: false, error: "GPX file appears empty" };
    }

    if (!hasAnyElevation) {
      return {
        success: false,
        error: "This GPX file contains no elevation data, which is required.",
      };
    }

    // Interpolate missing elevations
    const points = interpolateElevations(rawPoints);

    // Compute cumulative distance
    let cumulativeDist = 0;
    for (let i = 0; i < points.length; i++) {
      if (i === 0) {
        points[i].dist_m = 0;
      } else {
        cumulativeDist += haversineDistance(
          points[i - 1].lat,
          points[i - 1].lon,
          points[i].lat,
          points[i].lon,
        );
        points[i].dist_m = cumulativeDist;
      }
    }

    const totalDistance_m = cumulativeDist;

    // Segment the course (~200m intervals)
    const SEGMENT_LENGTH = 200;
    const segments: Segment[] = [];
    let segmentStart = 0;

    while (segmentStart < totalDistance_m) {
      const segmentEnd = Math.min(segmentStart + SEGMENT_LENGTH, totalDistance_m);

      // Find points at segment boundaries
      const startPoint = findPointAtDistance(points, segmentStart);
      const endPoint = findPointAtDistance(points, segmentEnd);

      const segmentLength = segmentEnd - segmentStart;
      const elevChange = endPoint.ele - startPoint.ele;
      const grade_pct = segmentLength > 0 ? (elevChange / segmentLength) * 100 : 0;

      segments.push({
        startDist_m: segmentStart,
        endDist_m: segmentEnd,
        elevStart: startPoint.ele,
        elevEnd: endPoint.ele,
        grade_pct,
        elevChange_m: elevChange,
      });

      segmentStart = segmentEnd;
    }

    // Compute elevation gain/loss
    let elevationGain_m = 0;
    let elevationLoss_m = 0;

    for (let i = 1; i < points.length; i++) {
      const diff = points[i].ele - points[i - 1].ele;
      if (diff > 0) {
        elevationGain_m += diff;
      } else {
        elevationLoss_m += Math.abs(diff);
      }
    }

    return {
      success: true,
      data: {
        points,
        segments,
        totalDistance_m,
        elevationGain_m,
        elevationLoss_m,
      },
    };
  } catch {
    return { success: false, error: "File could not be read as GPX" };
  }
}

function findPointAtDistance(points: TrackPoint[], distance: number): TrackPoint {
  if (distance <= 0) return points[0];
  const lastPoint = points.at(-1)
  if (lastPoint && distance >= lastPoint.dist_m) return lastPoint;

  for (let i = 1; i < points.length; i++) {
    if (points[i].dist_m >= distance) {
      // Interpolate between points[i-1] and points[i]
      const prev = points[i - 1];
      const curr = points[i];
      const ratio = (distance - prev.dist_m) / (curr.dist_m - prev.dist_m);

      return {
        lat: prev.lat + (curr.lat - prev.lat) * ratio,
        lon: prev.lon + (curr.lon - prev.lon) * ratio,
        ele: prev.ele + (curr.ele - prev.ele) * ratio,
        dist_m: distance,
      };
    }
  }

  return lastPoint ?? points[0];
}
