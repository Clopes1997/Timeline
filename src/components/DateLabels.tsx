import { formatDate } from "../utils/dateUtils";
import type { DateLabel } from "../types";
import { TIMELINE_CONFIG } from "../constants";

interface DateLabelsProps {
  dateLabels: DateLabel[];
  timelineWidth: number;
}

export function DateLabels({ dateLabels, timelineWidth }: DateLabelsProps) {
  return (
    <div className="timeline-scale" style={{ width: `${timelineWidth}px` }} role="row">
      {dateLabels.map((label, idx) => {
        const labelKey = formatDate(label.date) + "-" + label.position + "-" + idx;
        
        // Calculate width based on spacing to next label or end of timeline
        // Ensure minimum width and prevent overlap
        const nextLabel = dateLabels[idx + 1];
        const minWidth = TIMELINE_CONFIG.MIN_DATE_MARKER_WIDTH;
        
        let width: number;
        if (nextLabel) {
          // Width is the space available until the next label, but at least minimum width
          const availableSpace = nextLabel.position - label.position;
          width = Math.max(minWidth, availableSpace);
        } else {
          // Last label: use remaining space or minimum width
          width = Math.max(minWidth, timelineWidth - label.position);
        }
        
        // Ensure the marker doesn't extend beyond the timeline
        width = Math.min(width, timelineWidth - label.position);
        
        return (
          <div
            key={labelKey}
            className="date-marker"
            style={{ 
              left: `${label.position}px`,
              width: `${width}px`,
              minWidth: `${minWidth}px`
            }}
            role="columnheader"
          >
            <div className="date-marker-line" aria-hidden="true" />
            <div className="date-marker-label">
              <time dateTime={formatDate(label.date)}>
                {label.date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </time>
            </div>
          </div>
        );
      })}
    </div>
  );
}
