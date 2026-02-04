import { formatDate } from "../utils/dateUtils";
import type { DateLabel } from "../types";

interface DateLabelsProps {
  dateLabels: DateLabel[];
  timelineWidth: number;
}

export function DateLabels({ dateLabels, timelineWidth }: DateLabelsProps) {
  return (
    <div className="timeline-scale" style={{ width: `${timelineWidth}px` }} role="row">
      {dateLabels.map((label, idx) => {
        const labelKey = formatDate(label.date) + "-" + label.position + "-" + idx;
        return (
          <div
            key={labelKey}
            className="date-marker"
            style={{ left: `${label.position}px` }}
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
