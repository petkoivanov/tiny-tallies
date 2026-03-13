/**
 * Domain handler registry — maps MathDomain to DomainHandler.
 *
 * When adding a new domain, register its handler here.
 */

import type { DomainHandler, MathDomain } from '../types';
import { arithmeticHandler } from './arithmeticHandler';
import { fractionsHandler } from './fractions';
import { placeValueHandler } from './placeValue';
import { timeHandler } from './time';
import { moneyHandler } from './money';
import { patternsHandler } from './patterns';
import { measurementHandler } from './measurement';
import { ratiosHandler } from './ratios';
import { exponentsHandler } from './exponents';
import { expressionsHandler } from './expressions';
import { geometryHandler } from './geometry';
import { probabilityHandler } from './probability';
import { numberTheoryHandler } from './numberTheory';
import { basicGraphsHandler } from './basicGraphs';
import { dataAnalysisHandler } from './dataAnalysis';
import { linearEquationsHandler } from './linearEquations';
import { coordinateGeometryHandler } from './coordinateGeometry';
import { sequencesSeriesHandler } from './sequencesSeries';
import { statisticsHsHandler } from './statisticsHs';
import { systemsEquationsHandler } from './systemsEquations';

const HANDLERS: Record<MathDomain, DomainHandler> = {
  addition: arithmeticHandler,
  subtraction: arithmeticHandler,
  multiplication: arithmeticHandler,
  division: arithmeticHandler,
  fractions: fractionsHandler,
  place_value: placeValueHandler,
  time: timeHandler,
  money: moneyHandler,
  patterns: patternsHandler,
  measurement: measurementHandler,
  ratios: ratiosHandler,
  exponents: exponentsHandler,
  expressions: expressionsHandler,
  geometry: geometryHandler,
  probability: probabilityHandler,
  number_theory: numberTheoryHandler,
  basic_graphs: basicGraphsHandler,
  data_analysis: dataAnalysisHandler,
  linear_equations: linearEquationsHandler,
  coordinate_geometry: coordinateGeometryHandler,
  sequences_series: sequencesSeriesHandler,
  statistics_hs: statisticsHsHandler,
  systems_equations: systemsEquationsHandler,
};

/** Get the domain handler for a given operation */
export function getHandler(operation: MathDomain): DomainHandler {
  return HANDLERS[operation];
}
