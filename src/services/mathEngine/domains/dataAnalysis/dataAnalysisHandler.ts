/**
 * Data Analysis domain handler — dispatches to sub-generators by template type.
 *
 * Reads template.domainConfig.type to route to the correct generator.
 * Covers grades 4-8: dot plots, histograms, box plots, scatter plots,
 * mean/median/mode/range.
 */

import type {
  DomainHandler,
  DomainProblemData,
  ProblemTemplate,
} from '../../types';
import type { SeededRng } from '../../seededRng';

import {
  generateDotPlot,
  generateHistogram,
  generateBoxPlot,
  generateScatterPlot,
  generateCentralTendency,
} from './generators';

type DataAnalysisType =
  | 'dot_plot'
  | 'histogram'
  | 'box_plot'
  | 'scatter_plot'
  | 'central_tendency';

function getType(template: ProblemTemplate): DataAnalysisType {
  const cfg = template.domainConfig as
    | { type: DataAnalysisType }
    | undefined;
  return cfg?.type ?? 'dot_plot';
}

function dispatch(
  template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const type = getType(template);

  switch (type) {
    case 'dot_plot':
      return generateDotPlot(template, rng);
    case 'histogram':
      return generateHistogram(template, rng);
    case 'box_plot':
      return generateBoxPlot(template, rng);
    case 'scatter_plot':
      return generateScatterPlot(template, rng);
    case 'central_tendency':
      return generateCentralTendency(template, rng);
  }
}

export const dataAnalysisHandler: DomainHandler = {
  generate(template: ProblemTemplate, rng: SeededRng): DomainProblemData {
    return dispatch(template, rng);
  },
};
