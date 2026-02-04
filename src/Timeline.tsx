import { TimelineContainer } from "./TimelineContainer";
import type { TimelineItem, ItemUpdateCallback } from "./types";

interface TimelineProps {
  items: TimelineItem[];
  onItemUpdate?: ItemUpdateCallback;
}

function Timeline(props: TimelineProps) {
  return <TimelineContainer {...props} />;
}

export default Timeline;
