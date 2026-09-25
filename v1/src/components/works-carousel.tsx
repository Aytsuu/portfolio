import {
  useCallback,
  useRef,
  useState,
  type DragEvent,
  type MouseEvent,
  type PointerEvent,
} from "react";
import type { Project } from "../lib/load-projects";

const SLIDE_WIDTH_VW = 80;
const PEEK_VW = 10;
const DRAG_THRESHOLD_PX = 48;

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
  const handleClick = (event: MouseEvent<HTMLElement>) => {
    if (shouldSuppressClick()) {
      event.preventDefault();
      return;
    }
    if (!isActive) {
      event.preventDefault();
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

  if (project.link) {
    return (
      <a
        href={project.link}
        className={className}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        onDragStart={blockNativeDrag}
        aria-hidden={!isActive}
        tabIndex={isActive ? 0 : -1}
        draggable={false}
      >
        {body}
      </a>
    );
  }

  return (
    <article
      className={className}
      onClick={handleClick}
      onDragStart={blockNativeDrag}
      aria-hidden={!isActive}
      tabIndex={isActive ? 0 : -1}
    >
      {body}
    </article>
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
      const next = ((index % projects.length) + projects.length) % projects.length;
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

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    dragStartXRef.current = event.clientX;
    dragStartYRef.current = event.clientY;
    horizontalDragRef.current = false;
    isDraggingRef.current = true;
    setIsDragging(true);

    if (event.currentTarget.setPointerCapture) {
      event.currentTarget.setPointerCapture(event.pointerId);
    }
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
    isDraggingRef.current = false;
    setIsDragging(false);
    setDragOffsetPx(0);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    updateGripCursor(event);

    if (!isDraggingRef.current) {
      return;
    }

    const deltaX = event.clientX - dragStartXRef.current;
    const deltaY = event.clientY - dragStartYRef.current;

    if (
      !horizontalDragRef.current &&
      Math.abs(deltaX) > 8 &&
      Math.abs(deltaX) > Math.abs(deltaY)
    ) {
      horizontalDragRef.current = true;
    }

    if (horizontalDragRef.current && event.pointerType === "touch") {
      event.preventDefault();
    }

    if (Math.abs(deltaX) > 6) {
      suppressClickRef.current = true;
    }

    setDragOffsetPx(deltaX);
  };

  const finishDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) {
      return;
    }

    isDraggingRef.current = false;
    horizontalDragRef.current = false;
    setIsDragging(false);

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    const delta = event.clientX - dragStartXRef.current;
    const index = activeIndexRef.current;

    if (Math.abs(delta) > DRAG_THRESHOLD_PX) {
      suppressClickRef.current = true;
      if (delta < 0) {
        goTo(index + 1);
      } else {
        goTo(index - 1);
      }
    }

    setDragOffsetPx(0);
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
        } as React.CSSProperties
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
        className={`works-carousel-viewport${isDragging ? " is-dragging" : ""}${gripCursorVisible ? " is-grip-cursor" : ""}`}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onPointerDownCapture={handlePointerDown}
        onPointerMoveCapture={handlePointerMove}
        onPointerUpCapture={finishDrag}
        onPointerCancelCapture={finishDrag}
        onLostPointerCaptureCapture={finishDrag}
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
