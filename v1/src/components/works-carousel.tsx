import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type DragEvent,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
} from "react";
import type { Project } from "../lib/load-projects";

const SLIDE_WIDTH_VW = 80;
const PEEK_VW = 10;
const DRAG_THRESHOLD_PX = 40;
const DRAG_AXIS_LOCK_PX = 10;

interface WorksCarouselProps {
  projects: Project[];
}

type SlidePosition = "active" | "before" | "after";

interface SlideProps {
  project: Project;
  position: SlidePosition;
  onSelect: () => void;
  shouldSuppressClick: () => boolean;
}

function ProjectSlide({
  project,
  position,
  onSelect,
  shouldSuppressClick,
}: SlideProps) {
  const isActive = position === "active";

  const handleActivate = (event: MouseEvent<HTMLElement>) => {
    if (shouldSuppressClick()) {
      event.preventDefault();
      return;
    }
    if (!isActive) {
      event.preventDefault();
      onSelect();
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }
    event.preventDefault();
    if (!isActive) {
      onSelect();
    }
  };

  const blockNativeDrag = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
  };

  const body = (
    <>
      <div className="works-carousel-media">
        <img
          src={project.cover}
          alt={isActive ? project.name : ""}
          loading="lazy"
          decoding="async"
          draggable={false}
        />
      </div>
      {isActive ? (
        <div className="works-carousel-copy">
          <h3>{project.name}</h3>
          <p>{project.description}</p>
        </div>
      ) : null}
    </>
  );

  const className = `works-carousel-slide is-${position}`;

  if (isActive && project.link) {
    return (
      <a
        href={project.link}
        className={className}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleActivate}
        onDragStart={blockNativeDrag}
        draggable={false}
      >
        {body}
      </a>
    );
  }

  return (
    <div
      className={className}
      role="button"
      tabIndex={isActive ? 0 : -1}
      aria-hidden={!isActive}
      aria-label={isActive ? undefined : `Show ${project.name}`}
      onClick={handleActivate}
      onKeyDown={handleKeyDown}
      onDragStart={blockNativeDrag}
    >
      {body}
    </div>
  );
}

const INITIAL_SLIDE_INDEX = 3;

export function WorksCarousel({ projects }: WorksCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(() =>
    projects.length === 0
      ? 0
      : Math.min(INITIAL_SLIDE_INDEX, projects.length - 1),
  );
  const [dragOffsetPx, setDragOffsetPx] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [gripCursorVisible, setGripCursorVisible] = useState(false);
  const [gripCursor, setGripCursor] = useState({ x: 0, y: 0 });

  const viewportRef = useRef<HTMLDivElement>(null);
  const dragStartXRef = useRef(0);
  const dragStartYRef = useRef(0);
  const suppressClickRef = useRef(false);
  const isDraggingRef = useRef(false);
  const horizontalDragRef = useRef(false);
  const activeIndexRef = useRef(activeIndex);

  activeIndexRef.current = activeIndex;

  const goTo = useCallback(
    (index: number) => {
      if (projects.length === 0) return;
      const next =
        ((index % projects.length) + projects.length) % projects.length;
      setActiveIndex(next);
    },
    [projects.length],
  );

  const shouldSuppressClick = useCallback(() => {
    if (!suppressClickRef.current) {
      return false;
    }
    suppressClickRef.current = false;
    return true;
  }, []);

  const endDrag = useCallback(
    (clientX: number) => {
      if (!isDraggingRef.current) {
        return;
      }

      isDraggingRef.current = false;
      horizontalDragRef.current = false;
      setIsDragging(false);

      const delta = clientX - dragStartXRef.current;
      const index = activeIndexRef.current;

      if (Math.abs(delta) > DRAG_THRESHOLD_PX) {
        suppressClickRef.current = true;
        goTo(delta < 0 ? index + 1 : index - 1);
      }

      setDragOffsetPx(0);
    },
    [goTo],
  );

  const updateDrag = useCallback((clientX: number, clientY: number) => {
    const deltaX = clientX - dragStartXRef.current;
    const deltaY = clientY - dragStartYRef.current;

    if (
      !horizontalDragRef.current &&
      Math.abs(deltaX) > DRAG_AXIS_LOCK_PX &&
      Math.abs(deltaX) > Math.abs(deltaY)
    ) {
      horizontalDragRef.current = true;
    }

    if (Math.abs(deltaX) > 6) {
      suppressClickRef.current = true;
    }

    setDragOffsetPx(deltaX);
  }, []);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }

    const onTouchStart = (event: TouchEvent) => {
      if (event.touches.length !== 1) {
        return;
      }

      const touch = event.touches[0];
      dragStartXRef.current = touch.clientX;
      dragStartYRef.current = touch.clientY;
      horizontalDragRef.current = false;
      isDraggingRef.current = true;
      setIsDragging(true);
    };

    const onTouchMove = (event: TouchEvent) => {
      if (!isDraggingRef.current || event.touches.length !== 1) {
        return;
      }

      event.preventDefault();
      const touch = event.touches[0];
      updateDrag(touch.clientX, touch.clientY);
    };

    const onTouchEnd = (event: TouchEvent) => {
      const touch = event.changedTouches[0];
      endDrag(touch?.clientX ?? dragStartXRef.current);
    };

    viewport.addEventListener("touchstart", onTouchStart, {
      capture: true,
      passive: true,
    });
    viewport.addEventListener("touchmove", onTouchMove, {
      capture: true,
      passive: false,
    });
    viewport.addEventListener("touchend", onTouchEnd, {
      capture: true,
      passive: true,
    });
    viewport.addEventListener("touchcancel", onTouchEnd, {
      capture: true,
      passive: true,
    });

    return () => {
      viewport.removeEventListener("touchstart", onTouchStart, {
        capture: true,
      });
      viewport.removeEventListener("touchmove", onTouchMove, { capture: true });
      viewport.removeEventListener("touchend", onTouchEnd, { capture: true });
      viewport.removeEventListener("touchcancel", onTouchEnd, {
        capture: true,
      });
    };
  }, [endDrag, updateDrag]);

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || event.button !== 0) {
      return;
    }

    dragStartXRef.current = event.clientX;
    dragStartYRef.current = event.clientY;
    horizontalDragRef.current = false;
    isDraggingRef.current = true;
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const updateGripCursor = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") {
      return;
    }

    setGripCursor({ x: event.clientX, y: event.clientY });
  };

  const handlePointerEnter = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") {
      return;
    }

    setGripCursorVisible(true);
    setGripCursor({ x: event.clientX, y: event.clientY });
  };

  const handlePointerLeave = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") {
      return;
    }

    setGripCursorVisible(false);
    if (isDraggingRef.current) {
      endDrag(event.clientX);
    }
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    updateGripCursor(event);

    if (!isDraggingRef.current || event.pointerType !== "mouse") {
      return;
    }

    updateDrag(event.clientX, event.clientY);
  };

  const finishPointerDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || !isDraggingRef.current) {
      return;
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    endDrag(event.clientX);
  };

  if (projects.length === 0) {
    return (
      <div className="works-carousel-empty" role="status">
        <p>No projects yet.</p>
      </div>
    );
  }

  const trackOffset = `calc(${PEEK_VW}vw - ${activeIndex * SLIDE_WIDTH_VW}vw)`;
  const trackTransform =
    dragOffsetPx === 0
      ? `translateX(${trackOffset})`
      : `translateX(calc(${trackOffset} + ${dragOffsetPx}px))`;

  return (
    <div
      className="works-carousel"
      style={
        {
          "--carousel-peek": `${PEEK_VW}vw`,
        } as CSSProperties
      }
      aria-roledescription="carousel"
      aria-label="Projects"
    >
      {gripCursorVisible ? (
        <div
          className={`works-carousel-grip-ring${isDragging ? " is-dragging" : ""}`}
          style={{ left: gripCursor.x, top: gripCursor.y }}
          aria-hidden="true"
        />
      ) : null}

      <div
        ref={viewportRef}
        className={`works-carousel-viewport${isDragging ? " is-dragging" : ""}${gripCursorVisible ? " is-grip-cursor" : ""}`}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishPointerDrag}
        onPointerCancel={finishPointerDrag}
      >
        <div
          className={`works-carousel-track${isDragging ? " is-dragging" : ""}`}
          style={{ transform: trackTransform }}
        >
          {projects.map((project, index) => {
            const position: SlidePosition =
              index === activeIndex
                ? "active"
                : index < activeIndex
                  ? "before"
                  : "after";

            return (
              <ProjectSlide
                key={project.slug}
                project={project}
                position={position}
                onSelect={() => goTo(index)}
                shouldSuppressClick={shouldSuppressClick}
              />
            );
          })}
        </div>
      </div>

      <div
        className="works-carousel-pagination"
        role="tablist"
        aria-label="Select project"
      >
        {projects.map((project, index) => (
          <button
            key={project.slug}
            type="button"
            role="tab"
            className={`works-carousel-dot${index === activeIndex ? " is-active" : ""}`}
            aria-label={`Show ${project.name}`}
            aria-selected={index === activeIndex}
            onClick={() => goTo(index)}
          />
        ))}
      </div>
    </div>
  );
}
