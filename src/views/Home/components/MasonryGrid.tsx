import * as React from "react";

declare global {
  class ResizeObserver {
    constructor(callback: (entries: any[], observer: ResizeObserver) => void);
    observe(target: Element | SVGElement, options?: any): void;
    unobserve(target: Element | SVGElement): void;
    disconnect(): void;
  }
}

interface MasonryGridProps<T> {
  items: T[];
  children: (item: T, row: number, col: number) => React.ReactNode;
}

export default function MasonryGrid<T>(props: MasonryGridProps<T>) {
  const [cols, setCols] = React.useState(3);
  const ref = React.createRef<HTMLDivElement>();

  React.useEffect(() => {
    const elem = ref.current;
    const ob = new ResizeObserver(() => {
      if (ref.current) {
        const style = getComputedStyle(ref.current);
        const cssCols = parseInt(style.getPropertyValue("--cols"));

        setCols(cssCols);
      }
    });

    if (elem) {
      ob.observe(elem);
    }

    return () => {
      ob.disconnect();
    };
  }, [ref]);

  return (
    <div ref={ref} className="masonry">
      {Array(cols).fill(0).map((_, i) => (
        <div key={i}>
          {props.items.filter((_, j) => (i - j) % cols == 0).map((item, j) => props.children(item, j, i))}
        </div>
      ))}
    </div>
  );
}
