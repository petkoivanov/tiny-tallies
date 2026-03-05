import React from 'react';
import { render } from '@testing-library/react-native';

import { BadgeIcon } from '@/components/badges';
import { BADGE_EMOJIS } from '@/components/badges/badgeEmojis';
import { BADGES } from '@/services/achievement/badgeRegistry';

describe('BadgeIcon', () => {
  it('renders emoji text inside a circle container', () => {
    const { getByTestId } = render(
      <BadgeIcon emoji={'\u2B50'} earned={true} />,
    );

    const container = getByTestId('badge-icon-container');
    expect(container).toBeTruthy();
    // Verify emoji text is rendered as a child of the container
    expect(container.children.length).toBeGreaterThan(0);
  });

  it('applies dimmed opacity when earned=false', () => {
    const { getByTestId } = render(
      <BadgeIcon emoji="\u2B50" earned={false} />,
    );

    const container = getByTestId('badge-icon-container');
    // Flatten style array to check opacity
    const flatStyle = Array.isArray(container.props.style)
      ? Object.assign({}, ...container.props.style)
      : container.props.style;
    expect(flatStyle.opacity).toBe(0.4);
  });

  it('has full opacity when earned=true', () => {
    const { getByTestId } = render(
      <BadgeIcon emoji="\u2B50" earned={true} />,
    );

    const container = getByTestId('badge-icon-container');
    const flatStyle = Array.isArray(container.props.style)
      ? Object.assign({}, ...container.props.style)
      : container.props.style;
    expect(flatStyle.opacity).toBe(1);
  });

  it('respects custom size prop', () => {
    const { getByTestId } = render(
      <BadgeIcon emoji="\u2B50" earned={true} size={48} />,
    );

    const container = getByTestId('badge-icon-container');
    const flatStyle = Array.isArray(container.props.style)
      ? Object.assign({}, ...container.props.style)
      : container.props.style;
    expect(flatStyle.width).toBe(48);
    expect(flatStyle.height).toBe(48);
  });

  it('uses tier-specific border color when earned', () => {
    const { getByTestId: getGold } = render(
      <BadgeIcon emoji="\u2B50" earned={true} tier="gold" />,
    );
    const goldStyle = Object.assign(
      {},
      ...((getGold('badge-icon-container').props.style as unknown[]) ?? []),
    );
    expect(goldStyle.borderColor).toBe('#ffd700');

    const { getByTestId: getSilver } = render(
      <BadgeIcon emoji="\u2B50" earned={true} tier="silver" />,
    );
    const silverStyle = Object.assign(
      {},
      ...((getSilver('badge-icon-container').props.style as unknown[]) ?? []),
    );
    expect(silverStyle.borderColor).toBe('#c0c0c0');

    const { getByTestId: getBronze } = render(
      <BadgeIcon emoji="\u2B50" earned={true} tier="bronze" />,
    );
    const bronzeStyle = Object.assign(
      {},
      ...((getBronze('badge-icon-container').props.style as unknown[]) ?? []),
    );
    expect(bronzeStyle.borderColor).toBe('#cd7f32');
  });
});

describe('BADGE_EMOJIS', () => {
  it('has an entry for every badge ID in BADGES array', () => {
    const badgeIds = BADGES.map((b) => b.id);
    for (const id of badgeIds) {
      expect(BADGE_EMOJIS[id]).toBeDefined();
      expect(typeof BADGE_EMOJIS[id]).toBe('string');
      expect(BADGE_EMOJIS[id].length).toBeGreaterThan(0);
    }
  });

  it('has exactly the same number of entries as BADGES', () => {
    expect(Object.keys(BADGE_EMOJIS).length).toBe(BADGES.length);
  });
});
