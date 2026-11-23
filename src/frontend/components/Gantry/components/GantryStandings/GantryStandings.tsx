import { memo, useCallback, useEffect, useMemo, useRef } from 'react';
import { getTailwindStyle } from '@irdashies/utils/colors';
import { formatTime } from '@irdashies/utils/time';
import { Compound } from '../../../shared/Compound/Compound';
import { DriverRatingBadge } from '../../../shared/DriverRatingBadge/DriverRatingBadge';
import {
  DriverName as formatDriverName,
  extractDriverName,
} from '../../../shared/DriverName/DriverName';
import { type Gap, useFocusDriver, useHighlightColor } from '@irdashies/domain';
import { useActiveSimulator } from '@irdashies/context';
import { simulatorHasDriverRatings } from '@irdashies/types';
import { Tooltip } from '../Tooltip/Tooltip';
import { GantryPanel } from '../GantryPanel/GantryPanel';
import { useGantrySettings } from '../../hooks/useGantrySettings';
import {
  useGantrySessionData,
  type GantrySessionData,
} from '../../hooks/useGantrySessionData';
import type { NameFormat } from '@irdashies/types';

interface Props {
  followedCarIdx: number | null;
  stagedCarIdx?: number | null;
  onCamCarIdx?: number;
  onDriverStage?: (carIdx: number | null) => void;
  onDriverCut?: (carIdx: number) => void;
}

const DELTA_TOOLTIPS = [
  "How that driver's third-most-recent lap compared with your lap of the same age. Green means they were slower than you, red means faster.",
  "How that driver's second-most-recent lap compared with your lap of the same age. Green means they were slower than you, red means faster.",
  "How that driver's last completed lap compared with your last lap. Green means they were slower than you, red means faster.",
];

const HeaderCell = memo(
  ({
    label,
    tip,
    className,
  }: {
    label: string;
    tip: string;
    className: string;
  }) => (
    <Tooltip content={tip} placement="bottom">
      <span
        tabIndex={0}
        className={`${className} cursor-help focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent-400`}
      >
        {label}
      </span>
    </Tooltip>
  )
);
HeaderCell.displayName = 'HeaderCell';

/** Column widths shared by the header and the rows so they cannot drift. */
const COL = {
  position: 'w-7 shrink-0 text-center',
  carNumber: 'w-11 shrink-0 text-center border-l-2',
  name: 'flex-1 min-w-[120px] pl-1.5',
  compound: 'w-6 shrink-0',
  rating: 'w-[52px] shrink-0',
  pit: 'w-8 shrink-0 text-center',
  gap: 'w-12 shrink-0',
  interval: 'w-11 shrink-0',
  best: 'w-16 shrink-0',
  last: 'w-16 shrink-0',
  delta: 'w-10 shrink-0',
} as const;

const StandingsHeader = memo(() => (
  <div className="sticky top-0 z-20 flex h-[26px] items-center border-y border-slate-700 bg-slate-900 px-2 text-xs text-slate-400">
    <HeaderCell
      label="P"
      tip="Running order within the car class. Rows are grouped by class, leader first."
      className={COL.position}
    />
    <HeaderCell
      label="#"
      tip="Car number. The coloured bar to its left is the car's class."
      className={`${COL.carNumber} border-transparent`}
    />
    <HeaderCell
      label="Driver"
      tip="Driver name. Click to stage as next camera target · Double-click to cut immediately."
      className={`${COL.name} text-left`}
    />
    <HeaderCell
      label="T"
      tip="Tyre compound currently fitted, for cars that report one."
      className={`${COL.compound} text-center`}
    />
    <HeaderCell
      label="iR"
      tip="Driver's iRating at the start of the event."
      className={`${COL.rating} text-right`}
    />
    <HeaderCell
      label="Pit"
      tip="Shows PIT while the car is on pit road, and DNF once it has retired or been disqualified."
      className={COL.pit}
    />
    <HeaderCell
      label="Gap"
      tip="Time behind the class leader. A value such as 1L means whole laps down; the leader's own row reads 'gap'."
      className={`${COL.gap} text-right`}
    />
    <HeaderCell
      label="Int"
      tip="Time behind the car directly ahead in class. The leader's own row reads 'int'."
      className={`${COL.interval} text-right`}
    />
    <HeaderCell
      label="Best"
      tip="Fastest lap this car has set in the session. Purple marks the fastest lap set by anyone."
      className={`${COL.best} text-right`}
    />
    <HeaderCell
      label="Last"
      tip="Most recently completed lap. Purple is a session best, green is that driver's personal best."
      className={`${COL.last} text-right`}
    />
    {(['L-3', 'L-2', 'L-1'] as const).map((label, i) => (
      <HeaderCell
        key={label}
        label={label}
        tip={DELTA_TOOLTIPS[i]}
        className={`${COL.delta} text-right`}
      />
    ))}
  </div>
));
StandingsHeader.displayName = 'StandingsHeader';

const formatGap = (
  gap: Gap | undefined,
  position: number | undefined
): string => {
  if (position === 1) return 'gap';
  if (gap === undefined) return '-';
  if (gap.laps !== 0) return `${gap.laps}L`;
  if (gap.value !== undefined) return gap.value.toFixed(1);
  return '-';
};

const formatInterval = (
  interval: number | Gap | undefined,
  position: number | undefined
): string => {
  if (position === 1) return 'int';
  if (interval === undefined) return '-';
  if (typeof interval === 'object') return formatGap(interval, position);
  return interval.toFixed(1);
};

export const GantryStandings = memo(
  ({
    followedCarIdx,
    stagedCarIdx,
    onCamCarIdx,
    onDriverStage,
    onDriverCut,
  }: Props) => {
    const simulator = useActiveSimulator();
    const showRatings = simulatorHasDriverRatings(simulator);
    const nameFormat = useGantrySettings()?.driverNameFormat ?? 'surname';
    const { standingsByClass } = useGantrySessionData();
    const followedRef = useRef<HTMLDivElement | null>(null);

    const handleFocusDriver = useFocusDriver();
    const highlightColor = useHighlightColor();
    const highlightColorHex = `#${highlightColor.toString(16).padStart(6, '0')}`;

    useEffect(() => {
      followedRef.current?.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }, [followedCarIdx]);

    const isMultiClass = standingsByClass.length > 1;

    return (
      <GantryPanel title="Standings">
        <div className="flex-1 min-h-0 overflow-auto scroll-pt-[26px]">
          <div className="min-w-min">
            <StandingsHeader />
            {standingsByClass.map(([classId, classDrivers]) => {
              const firstDriver = classDrivers[0];
              const carClass = firstDriver?.carClass;
              const classColorHex =
                carClass?.color !== undefined
                  ? `#${carClass.color.toString(16).padStart(6, '0')}`
                  : '#94a3b8';
              return (
                <div key={classId}>
                  <div
                    className="flex h-[26px] items-center gap-2 border-b border-slate-700 bg-slate-900 px-2"
                    style={{
                      borderLeftColor: classColorHex,
                      borderLeftWidth: 2,
                    }}
                  >
                    <Tooltip
                      content="Car class group. Position, gap and interval are all worked out within the class, not against the whole field."
                      placement="bottom"
                    >
                      <span
                        tabIndex={0}
                        className="cursor-help text-xs font-semibold uppercase tracking-[0.06em] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent-400"
                        style={{ color: classColorHex }}
                      >
                        {carClass?.name}
                      </span>
                    </Tooltip>
                  </div>
                  {classDrivers.map((driver) => (
                    <GantryDriverRow
                      key={driver.carIdx}
                      driver={driver}
                      followedCarIdx={followedCarIdx}
                      followedRef={followedRef}
                      isMultiClass={isMultiClass}
                      highlightColorHex={highlightColorHex}
                      nameFormat={nameFormat}
                      onFocusDriver={handleFocusDriver}
                      showRatings={showRatings}
                      isOnCam={
                        onCamCarIdx !== undefined &&
                        driver.carIdx === onCamCarIdx
                      }
                      isStaged={
                        stagedCarIdx !== undefined &&
                        stagedCarIdx !== null &&
                        driver.carIdx === stagedCarIdx
                      }
                      onStage={onDriverStage}
                      onCut={onDriverCut}
                    />
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      </GantryPanel>
    );
  }
);
GantryStandings.displayName = 'GantryStandings';

interface GantryDriverRowProps {
  driver: GantrySessionData['standingsByClass'][number][1][number];
  followedCarIdx: number | null;
  followedRef: React.RefObject<HTMLDivElement | null>;
  isMultiClass: boolean;
  highlightColorHex: string;
  nameFormat: NameFormat;
  onFocusDriver: (carNumber: string) => void;
  showRatings: boolean;
  isOnCam?: boolean;
  isStaged?: boolean;
  onStage?: (carIdx: number | null) => void;
  onCut?: (carIdx: number) => void;
}

const GantryDriverRow = memo(
  ({
    driver,
    followedCarIdx,
    followedRef,
    isMultiClass,
    highlightColorHex,
    nameFormat,
    onFocusDriver,
    showRatings,
    isOnCam,
    isStaged,
    onStage,
    onCut,
  }: GantryDriverRowProps) => {
    const isPlayer = driver.isPlayer;
    const isFollowed = driver.carIdx === followedCarIdx;
    const hasStaging = onStage !== undefined || onCut !== undefined;

    const tailwindStyles = useMemo(
      () => getTailwindStyle(driver.carClass.color, undefined, isMultiClass),
      [driver.carClass.color, isMultiClass]
    );

    const displayName = formatDriverName(
      extractDriverName(driver.driver.name, false),
      nameFormat
    );

    const bestTimeStr = formatTime(driver.fastestTime);
    const lastTimeStr = formatTime(driver.lastTime);

    const lapDeltas = driver.lapTimeDeltas;
    const numDeltas = 3;
    const deltaSlots = Array.from({ length: numDeltas }, (_, i) => {
      if (!lapDeltas || lapDeltas.length === 0) return undefined;
      const offset = lapDeltas.length - numDeltas + i;
      return offset >= 0 ? lapDeltas[offset] : undefined;
    });

    const pitLabel = driver.onPitRoad ? 'PIT' : driver.dnf ? 'DNF' : '';

    // Double-click detection: first click sets a timer; a second click within
    // 200 ms cancels the timer and lets onDoubleClick handle the action.
    const isStagedRef = useRef(isStaged);
    isStagedRef.current = isStaged;
    const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleClick = useCallback(() => {
      if (!hasStaging) {
        onFocusDriver(driver.driver.carNum);
        return;
      }
      if (clickTimerRef.current !== null) {
        clearTimeout(clickTimerRef.current);
        clickTimerRef.current = null;
        return;
      }
      clickTimerRef.current = setTimeout(() => {
        clickTimerRef.current = null;
        if (isStagedRef.current) {
          onStage?.(null);
        } else {
          onStage?.(driver.carIdx);
        }
      }, 200);
    }, [
      hasStaging,
      onFocusDriver,
      driver.driver.carNum,
      driver.carIdx,
      onStage,
    ]);

    const handleDoubleClick = useCallback(() => {
      if (!hasStaging) return;
      if (clickTimerRef.current !== null) {
        clearTimeout(clickTimerRef.current);
        clickTimerRef.current = null;
      }
      onCut?.(driver.carIdx);
    }, [hasStaging, onCut, driver.carIdx]);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (hasStaging) {
            if (isStaged) {
              onStage?.(null);
            } else {
              onStage?.(driver.carIdx);
            }
          } else {
            onFocusDriver(driver.driver.carNum);
          }
        }
      },
      [
        hasStaging,
        isStaged,
        onStage,
        onFocusDriver,
        driver.carIdx,
        driver.driver.carNum,
      ]
    );

    const rowTitle = hasStaging
      ? `Click to stage as next · Double-click to cut to ${driver.driver.name}`
      : `Click to point the sim camera at ${driver.driver.name} (works in a replay or while spectating)`;

    return (
      <div
        ref={isFollowed ? followedRef : undefined}
        role="button"
        tabIndex={0}
        title={rowTitle}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onKeyDown={handleKeyDown}
        style={
          isFollowed
            ? ({ '--tw-ring-color': highlightColorHex } as React.CSSProperties)
            : undefined
        }
        className={[
          'flex h-6 items-center border-b border-slate-700/55 px-2 text-sm tabular-nums transition-opacity duration-150',
          'cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent-400',
          isOnCam
            ? 'bg-red-900/20 hover:bg-red-900/30'
            : isStaged
              ? 'bg-amber-900/20 hover:bg-amber-900/30'
              : isPlayer
                ? 'bg-yellow-500/20 text-amber-300 hover:bg-yellow-500/30'
                : 'hover:bg-slate-800',
          isFollowed ? 'ring-1 relative z-10' : '',
          followedCarIdx !== null && !isFollowed ? 'opacity-40' : '',
          followedCarIdx === null && !driver.onTrack ? 'opacity-60' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {/* P */}
        <span
          className={`${COL.position} font-semibold ${isPlayer ? 'text-amber-300' : 'text-white'}`}
        >
          {driver.classPosition ?? driver.position}
        </span>
        {/* # */}
        <span
          className={`${COL.carNumber} flex items-center justify-center self-stretch ${tailwindStyles.driverIcon} text-white`}
        >
          #{driver.driver.carNum}
        </span>
        {/* Driver Name + badges */}
        <span
          className={`${COL.name} flex items-center gap-1.5 overflow-hidden`}
        >
          <span className="truncate">{displayName}</span>
          {isOnCam && (
            <span className="shrink-0 px-1 rounded border border-red-700 text-red-400 text-[9px] font-semibold uppercase tracking-wide leading-4">
              On cam
            </span>
          )}
          {isStaged && (
            <span className="shrink-0 px-1 rounded border border-amber-500 text-amber-400 text-[9px] font-semibold uppercase tracking-wide leading-4">
              Next
            </span>
          )}
        </span>
        {/* Tyre */}
        <span className={`${COL.compound} flex items-center justify-center`}>
          {driver.tireCompound !== undefined && driver.carId !== undefined && (
            <Compound tireCompound={driver.tireCompound} />
          )}
        </span>
        {/* iR */}
        <span
          className={`${COL.rating} flex items-center justify-end text-xs text-slate-300`}
        >
          {showRatings && (
            <DriverRatingBadge
              license={driver.driver.license}
              rating={driver.driver.rating}
              format="rating-bw-no-license"
            />
          )}
        </span>
        {/* Pit */}
        <span className={`${COL.pit} text-xs font-semibold`}>
          {pitLabel && (
            <span className={driver.dnf ? 'text-red-400' : 'text-yellow-400'}>
              {pitLabel}
            </span>
          )}
        </span>
        {/* Gap */}
        <span className={`${COL.gap} text-right`}>
          {formatGap(driver.gap, driver.classPosition ?? driver.position)}
        </span>
        {/* Interval */}
        <span className={`${COL.interval} text-right`}>
          {formatInterval(
            driver.interval,
            driver.classPosition ?? driver.position
          )}
        </span>
        {/* Best */}
        <span
          className={`${COL.best} text-right tabular-nums ${driver.hasFastestTime ? 'text-purple-400' : ''}`}
        >
          {bestTimeStr}
        </span>
        {/* Last */}
        <span
          className={`${COL.last} text-right tabular-nums ${
            driver.lastTimeState === 'session-fastest'
              ? 'text-purple-400'
              : driver.lastTimeState === 'personal-best'
                ? 'text-green-400'
                : ''
          }`}
        >
          {lastTimeStr}
        </span>
        {/* L-3, L-2, L-1 */}
        {deltaSlots.map((delta, i) => (
          <span
            key={i}
            className={`${COL.delta} text-right tabular-nums ${
              delta !== undefined
                ? delta > 0
                  ? 'text-green-400'
                  : 'text-red-400'
                : ''
            }`}
          >
            {delta !== undefined
              ? Math.abs(delta).toFixed(1)
              : isPlayer
                ? '-'
                : ''}
          </span>
        ))}
      </div>
    );
  }
);
GantryDriverRow.displayName = 'GantryDriverRow';
