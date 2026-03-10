/**
 * Basic Graphs domain handler — dispatches to sub-generators by template type.
 *
 * Reads template.domainConfig.type to route to the correct generator.
 * Covers grades 1-4: picture graphs, bar graphs, tally charts.
 */

import type {
  DomainHandler,
  DomainProblemData,
  ProblemTemplate,
} from '../../types';
import type { SeededRng } from '../../seededRng';

import {
  generatePictureGraph,
  generateBarGraph,
  generateTallyChart,
} from './generators';

type BasicGraphsType = 'picture_graph' | 'bar_graph' | 'tally_chart';

function getType(template: ProblemTemplate): BasicGraphsType {
  const cfg = template.domainConfig as
    | { type: BasicGraphsType }
    | undefined;
  return cfg?.type ?? 'picture_graph';
}

function dispatch(
  template: ProblemTemplate,
  rng: SeededRng,
): DomainProblemData {
  const type = getType(template);

  switch (type) {
    case 'picture_graph':
      return generatePictureGraph(template, rng);
    case 'bar_graph':
      return generateBarGraph(template, rng);
    case 'tally_chart':
      return generateTallyChart(template, rng);
  }
}

export const basicGraphsHandler: DomainHandler = {
  generate(template: ProblemTemplate, rng: SeededRng): DomainProblemData {
    return dispatch(template, rng);
  },
};
