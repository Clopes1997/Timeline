import { useState, useMemo, useEffect, useRef } from "react";
import ReactDOM from "react-dom/client";
import timelineItems from "./timelineItems";
import Timeline from "./Timeline";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { TOOLTIP_HOVER_DELAY_MS } from "./constants";
import type { TimelineItem, ItemUpdateCallback } from "./types";

function App() {
  const [items, setItems] = useState<TimelineItem[]>(timelineItems);
  const [searchQuery, setSearchQuery] = useState("");
  const [showInfo, setShowInfo] = useState(false);
  const infoRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleItemUpdate: ItemUpdateCallback = (updatedItem) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === updatedItem.id ? updatedItem : item
      )
    );
  };

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) {
      return items;
    }

    const query = searchQuery.toLowerCase().trim();
    return items.filter(item =>
      item.name.toLowerCase().includes(query)
    );
  }, [items, searchQuery]);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setShowInfo(true);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setShowInfo(false);
    }, TOOLTIP_HOVER_DELAY_MS);
  };

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-title-container">
          <h1>Timeline Visualization</h1>
          <div
            className="info-icon-container"
            ref={infoRef}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <button
              className="info-icon"
              aria-label="Show app information"
              type="button"
              onFocus={handleMouseEnter}
              onBlur={handleMouseLeave}
            >
              <span aria-hidden="true">i</span>
            </button>
            {showInfo && (
              <div
                className="info-tooltip"
                role="tooltip"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <h3>How to Use</h3>
                <ul>
                  <li><strong>Tab Navigation:</strong> Use Tab to navigate between timeline items. Press Enter or Space to edit an item's name.</li>
                  <li><strong>Edit Text:</strong> Double-click any timeline item or press Enter/Space when focused to edit its name. Press Enter to save or Escape to cancel.</li>
                  <li><strong>Drag & Drop:</strong> Click and drag timeline items to move them along the timeline. Drag the left or right edges to resize and change the duration.</li>
                  <li><strong>Search:</strong> Use the search bar to filter items by name.</li>
                  <li><strong>Zoom:</strong> Use the zoom controls or keyboard shortcuts (Ctrl/Cmd + or -) to adjust the timeline scale.</li>
                </ul>
              </div>
            )}
          </div>
        </div>
        <p>{filteredItems.length} of {items.length} items</p>
      </header>
      <div className="search-container">
        <label htmlFor="search-input" className="sr-only">Search items by name</label>
        <input
          id="search-input"
          type="text"
          placeholder="Search items by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
          aria-label="Search items by name"
        />
      </div>
      <ErrorBoundary>
        <Timeline items={filteredItems} onItemUpdate={handleItemUpdate} />
      </ErrorBoundary>
    </div>
  );
}

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
