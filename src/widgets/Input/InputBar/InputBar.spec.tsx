import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { InputBar } from './InputBar';

describe('InputBar', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <InputBar brake={0.5} throttle={0.7} clutch={0.3} />
    );
    expect(container).toBeInTheDocument();
  });

  it('renders an SVG element', () => {
    const { container } = render(
      <InputBar brake={0.5} throttle={0.7} clutch={0.3} />
    );
    const svgElement = container.querySelector('svg');
    expect(svgElement).toBeInTheDocument();
  });

  it('renders the correct number of bars', () => {
    const { container } = render(
      <InputBar brake={0.5} throttle={0.7} clutch={0.3} />
    );
    const rectElements = container.querySelectorAll('rect');
    expect(rectElements.length).toBe(3);
  });
  it('renders text with correct values', () => {
    const { container } = render(
      <InputBar brake={0.5} throttle={0.7} clutch={0.3} />
    );
    const textElements = container.querySelectorAll('text');
    expect(textElements[0].textContent).toBe('30'); // clutch
    expect(textElements[1].textContent).toBe('50'); // brake
    expect(textElements[2].textContent).toBe('70'); // throttle
  });
});
