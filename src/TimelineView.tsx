import TimelineItem from "./components/TimelineItem";
import { DateLabels } from "./components/DateLabels";
import type { TimelineItemInternal, DateLabel } from "./types";

export interface ItemLayout {
  left: number;
  width: number;
  days: number;
  itemColor: string;
}

interface TimelineViewProps {
  timelineWidth: number;
  dateLabels: DateLabel[];
  lanes: TimelineItemInternal[][];
  itemLayoutMap: Map<number, ItemLayout>;
  tooltipItem: { name: string } | null;
  tooltipPosition: { top: number; left: number };
}

export function TimelineView({
  timelineWidth,
  dateLabels,
  lanes,
  itemLayoutMap,
  tooltipItem,
  tooltipPosition,
}: TimelineViewProps) {
  return (
    <>
      <div className="timeline-header" role="rowheader">
        <div className="lane-label-header" aria-hidden="true" />
        <DateLabels dateLabels={dateLabels} timelineWidth={timelineWidth} />
      </div>

      <div className="timeline-content" role="rowgroup">
        {lanes.map((lane, laneIndex) => (
          <div key={laneIndex} className="timeline-lane" role="row">
            <div className="lane-label" aria-hidden="true" />
            <div className="lane-items" style={{ width: `${timelineWidth}px` }} role="gridcell">
              {lane.map((item) => {
                const layout = itemLayoutMap.get(item.id);
                if (!layout) return null;
                return (
                  <TimelineItem
                    key={item.id}
                    item={item}
                    left={layout.left}
                    width={layout.width}
                    days={layout.days}
                    itemColor={layout.itemColor}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {tooltipItem && (
        <div
          className="item-name-tooltip"
          style={{
            top: `${tooltipPosition.top}px`,
            left: `${tooltipPosition.left}px`,
          }}
          role="tooltip"
        >
          {tooltipItem.name}
        </div>
      )}
    </>
  );
}
