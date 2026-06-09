import { CheckinSummary } from "@/store/types";
import { subDays, isAfter } from "date-fns";

export interface TrendDataPoint {
  date: string;
  comedone: number;
  papule: number;
  pustule: number;
  nodule: number;
  total: number;
}

/**
 * Transforms a list of check-in summaries into a chronological array of trend data points.
 * Averages counts if there are multiple check-ins on the same day.
 */
export function transformCheckinsToTrendData(checkins: CheckinSummary[]): TrendDataPoint[] {
  // Sort chronologically (oldest to newest)
  const sorted = [...checkins].sort((a, b) => new Date(a.captured_at).getTime() - new Date(b.captured_at).getTime());
  
  const dailyData: Record<string, TrendDataPoint> = {};

  sorted.forEach(checkin => {
    // Use local date string as key
    const dateKey = new Date(checkin.captured_at).toLocaleDateString('en-CA'); // YYYY-MM-DD format
    
    if (!dailyData[dateKey]) {
      dailyData[dateKey] = {
        date: checkin.captured_at,
        comedone: checkin.lesion_counts.comedone,
        papule: checkin.lesion_counts.papule,
        pustule: checkin.lesion_counts.pustule,
        nodule: checkin.lesion_counts.nodule,
        total: checkin.lesion_counts.total,
      };
    } else {
      // If multiple on same day, just use the latest one or average. We'll use latest for simplicity.
      dailyData[dateKey] = {
        date: checkin.captured_at,
        comedone: checkin.lesion_counts.comedone,
        papule: checkin.lesion_counts.papule,
        pustule: checkin.lesion_counts.pustule,
        nodule: checkin.lesion_counts.nodule,
        total: checkin.lesion_counts.total,
      };
    }
  });

  return Object.values(dailyData);
}

/**
 * Computes a simple moving average for an array of numbers.
 */
export function computeRollingAverage(data: number[], windowSize: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < windowSize - 1) {
      // Not enough data points for a full window, use average of available points
      const slice = data.slice(0, i + 1);
      const sum = slice.reduce((a, b) => a + b, 0);
      result.push(sum / slice.length);
    } else {
      const slice = data.slice(i - windowSize + 1, i + 1);
      const sum = slice.reduce((a, b) => a + b, 0);
      result.push(sum / windowSize);
    }
  }
  return result;
}

/**
 * Calculates the distribution of severity grades across check-ins.
 */
export function getSeverityDistribution(checkins: CheckinSummary[]): Record<string, number> {
  const distribution: Record<string, number> = {
    Clear: 0,
    Mild: 0,
    Moderate: 0,
    Severe: 0,
  };

  checkins.forEach(checkin => {
    const grade = checkin.severity_grade;
    if (distribution[grade] !== undefined) {
      distribution[grade]++;
    }
  });

  return distribution;
}

/**
 * Filters check-ins to only those within the last 'days' days.
 */
export function getCheckinsInRange(checkins: CheckinSummary[], days: number): CheckinSummary[] {
  const cutoffDate = subDays(new Date(), days);
  return checkins.filter(checkin => isAfter(new Date(checkin.captured_at), cutoffDate));
}
