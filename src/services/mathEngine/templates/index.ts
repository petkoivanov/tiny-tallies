import type { Operation, ProblemTemplate } from '../types';
import { ADDITION_TEMPLATES } from './addition';
import { SUBTRACTION_TEMPLATES } from './subtraction';

export const ALL_TEMPLATES: readonly ProblemTemplate[] = [
  ...ADDITION_TEMPLATES,
  ...SUBTRACTION_TEMPLATES,
];

export function findTemplate(templateId: string): ProblemTemplate {
  const template = ALL_TEMPLATES.find((t) => t.id === templateId);
  if (!template) {
    throw new Error(
      `Template not found: "${templateId}". Available templates: ${ALL_TEMPLATES.map((t) => t.id).join(', ')}`,
    );
  }
  return template;
}

export function getTemplatesBySkill(skillId: string): ProblemTemplate[] {
  return ALL_TEMPLATES.filter((t) => t.skillId === skillId);
}

export function getTemplatesByOperation(
  operation: Operation,
): ProblemTemplate[] {
  return ALL_TEMPLATES.filter((t) => t.operation === operation);
}

export { ADDITION_TEMPLATES } from './addition';
export { SUBTRACTION_TEMPLATES } from './subtraction';
