/**
 * Domain handler registry — maps Operation to DomainHandler.
 *
 * When adding a new domain, register its handler here.
 */

import type { DomainHandler, Operation } from '../types';
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

const HANDLERS: Record<Operation, DomainHandler> = {
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
};

/** Get the domain handler for a given operation */
export function getHandler(operation: Operation): DomainHandler {
  return HANDLERS[operation];
}
