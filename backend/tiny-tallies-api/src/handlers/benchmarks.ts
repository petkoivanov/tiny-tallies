/**
 * Benchmarks Handler
 *
 * Returns peer percentile data for a child based on their age range
 * and optional state. Only works for children who have opted in.
 */

import { Env, BenchmarkDomain, BenchmarkResponse } from '../types';
import { jsonResponse, errorResponse, getUserId } from '../middleware';

export async function handleGetBenchmarks(request: Request, env: Env): Promise<Response> {
  const userId = getUserId(request);
  if (!userId) return errorResponse('Missing X-User-Id header', 401);

  const url = new URL(request.url);
  const childId = url.pathname.split('/').pop();
  if (!childId) return errorResponse('Missing childId', 400);

  // Verify child belongs to user and is opted in
  const child = await env.DB.prepare(
    'SELECT id, age_range, state_code, benchmark_opt_in, elo_rating FROM child_profiles WHERE id = ? AND user_id = ?'
  ).bind(childId, userId).first<{
    id: string;
    age_range: string | null;
    state_code: string | null;
    benchmark_opt_in: number;
    elo_rating: number;
  }>();

  if (!child) return errorResponse('Child not found', 404);
  if (!child.benchmark_opt_in) return errorResponse('Benchmarking not enabled', 403);
  if (!child.age_range) return errorResponse('Age range not set', 400);

  // Get child's per-domain Elo averages
  const childSkills = await env.DB.prepare(
    'SELECT skill_id, elo FROM skill_states WHERE child_id = ?'
  ).bind(childId).all<{ skill_id: string; elo: number }>();

  const childDomainElos: Record<string, { sum: number; count: number }> = {};
  let overallSum = 0;
  let overallCount = 0;
  for (const s of childSkills.results) {
    const domain = s.skill_id.split('.')[0];
    if (!childDomainElos[domain]) childDomainElos[domain] = { sum: 0, count: 0 };
    childDomainElos[domain].sum += s.elo;
    childDomainElos[domain].count += 1;
    overallSum += s.elo;
    overallCount += 1;
  }

  // Get national benchmarks
  const nationalBenchmarks = await env.DB.prepare(
    'SELECT * FROM benchmark_aggregates WHERE age_range = ? AND scope = ?'
  ).bind(child.age_range, 'national').all<Record<string, unknown>>();

  const national = buildDomainList(nationalBenchmarks.results, childDomainElos, overallSum, overallCount);

  // Get state benchmarks if applicable
  let state: BenchmarkDomain[] | null = null;
  if (child.state_code) {
    const stateBenchmarks = await env.DB.prepare(
      'SELECT * FROM benchmark_aggregates WHERE age_range = ? AND scope = ?'
    ).bind(child.age_range, child.state_code).all<Record<string, unknown>>();

    if (stateBenchmarks.results.length > 0) {
      state = buildDomainList(stateBenchmarks.results, childDomainElos, overallSum, overallCount);
    }
  }

  const response: BenchmarkResponse = {
    national,
    state,
    ageRange: child.age_range,
    stateCode: child.state_code,
  };

  return jsonResponse(response);
}

function buildDomainList(
  rows: Record<string, unknown>[],
  childDomainElos: Record<string, { sum: number; count: number }>,
  overallSum: number,
  overallCount: number,
): BenchmarkDomain[] {
  return rows.map((row) => {
    const domain = row.skill_domain as string;
    let childElo: number;
    if (domain === 'overall') {
      childElo = overallCount > 0 ? overallSum / overallCount : 1000;
    } else {
      const de = childDomainElos[domain];
      childElo = de ? de.sum / de.count : 1000;
    }

    const p25 = row.percentile_25 as number;
    const p50 = row.percentile_50 as number;
    const p75 = row.percentile_75 as number;
    const p90 = row.percentile_90 as number;

    // Estimate child's percentile position
    let percentile: number;
    if (childElo <= p25) percentile = Math.round((childElo / p25) * 25);
    else if (childElo <= p50) percentile = 25 + Math.round(((childElo - p25) / (p50 - p25)) * 25);
    else if (childElo <= p75) percentile = 50 + Math.round(((childElo - p50) / (p75 - p50)) * 25);
    else if (childElo <= p90) percentile = 75 + Math.round(((childElo - p75) / (p90 - p75)) * 15);
    else percentile = 90 + Math.min(9, Math.round(((childElo - p90) / (p90 * 0.1)) * 9));

    percentile = Math.max(1, Math.min(99, percentile));

    return {
      skillDomain: domain,
      childElo: Math.round(childElo),
      percentile,
      percentile25: p25,
      percentile50: p50,
      percentile75: p75,
      percentile90: p90,
      sampleSize: row.sample_size as number,
    };
  });
}
