import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { DriverRatingBadge } from './DriverRatingBadge';

describe('DriverRatingBadge', () => {
  it('renders with default props', () => {
    const { container } = render(<DriverRatingBadge />);
    expect(container.textContent).toBe('R 0.0k');
  });

  it('renders with license A and rating 5000', () => {
    const { container } = render(
      <DriverRatingBadge license="A" rating={5000} />
    );
    expect(container.textContent).toBe('A 5.0k');
  });

  it('renders with license B and rating 10000', () => {
    const { container } = render(
      <DriverRatingBadge license="B" rating={10000} />
    );
    expect(container.textContent).toBe('B 10k');
  });

  it('renders with license C and rating 15000', () => {
    const { container } = render(
      <DriverRatingBadge license="C" rating={15000} />
    );
    expect(container.textContent).toBe('C 15k');
  });

  it('renders with license D and rating 2000', () => {
    const { container } = render(
      <DriverRatingBadge license="D" rating={2000} />
    );
    expect(container.textContent).toBe('D 2.0k');
  });

  it('renders with license R and rating 7500', () => {
    const { container } = render(
      <DriverRatingBadge license="R" rating={7500} />
    );
    expect(container.textContent).toBe('R 7.5k');
  });

  it('renders with unknown license and rating 3000', () => {
    const { container } = render(
      <DriverRatingBadge license="X" rating={3000} />
    );
    expect(container.textContent).toBe('X 3.0k');
  });

  it('renders with undefined license and rating', () => {
    const { container } = render(
      <DriverRatingBadge license={undefined} rating={undefined} />
    );
    expect(container.textContent).toBe('R 0.0k');
  });
});
