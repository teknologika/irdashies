import * as d3 from 'd3';
import { useEffect, useRef, useState } from 'react';
import tailwindColors from 'tailwindcss/colors';

const COLORS = [tailwindColors.red['500'], tailwindColors.green['500']];

export interface InputTraceProps {
  brake: number;
  throttle: number;
}

export const InputTrace = ({ brake, throttle }: InputTraceProps) => {
  const svgRef = useRef<SVGSVGElement>(null);

  const [brakeArray, setBrakeArray] = useState<number[]>(
    Array.from({ length: 400 }, () => 0),
  );
  const [throttleArray, setThrottleArray] = useState<number[]>(
    Array.from({ length: 400 }, () => 0),
  );

  useEffect(() => {
    // slice first value and append new value
    setThrottleArray((v) => [...v.slice(1), throttle]);
    setBrakeArray((v) => [...v.slice(1), brake]);
  }, [brake, throttle]);

  useEffect(() => {
    drawGraph(svgRef.current, [brakeArray, throttleArray]);
  }, [brakeArray, throttleArray]);

  return <svg ref={svgRef} width="400" height="100"></svg>;
};

function drawGraph(svgElement: SVGSVGElement | null, valueArray: number[][]) {
  if (!svgElement) return;

  const svg = d3.select(svgElement);
  const width = +svg.attr('width');
  const height = +svg.attr('height');

  svg.selectAll('*').remove();

  const xScale = d3.scaleLinear().domain([0, width]).range([0, width]);
  const yScale = d3.scaleLinear().domain([0, 1]).range([height, 0]);

  drawYAxis(svg, yScale, width);

  valueArray.forEach((values, i) => {
    drawLine(svg, values, xScale, yScale, COLORS[i % COLORS.length]);
  });
}

function drawYAxis(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  yScale: d3.ScaleLinear<number, number>,
  width: number,
) {
  const yAxis = d3
    .axisLeft(yScale)
    .tickValues(d3.range(0, 1.25, 0.25))
    .tickFormat(() => '');

  svg
    .append('g')
    .call(yAxis)
    .selectAll('line')
    .attr('x2', width)
    .attr('stroke', '#666')
    .attr('stroke-dasharray', '2,2');

  svg.select('.domain').remove();
}

function drawLine(
  svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
  valueArray: number[],
  xScale: d3.ScaleLinear<number, number>,
  yScale: d3.ScaleLinear<number, number>,
  color: string,
) {
  const line = d3
    .line<number>()
    .x((_, i) => xScale(i))
    .y((d) => yScale(d))
    .curve(d3.curveBasis);

  svg
    .append('g')
    .append('path')
    .datum(valueArray)
    .attr('fill', 'none')
    .attr('stroke', color) // Changed the stroke color to red
    .attr('stroke-width', 3)
    .attr('d', line);
}
