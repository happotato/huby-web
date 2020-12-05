import * as React from "react";

interface ObserverProps {
  className?: string;
  children?: React.ReactNode;
  callback: (e: Element) => void;
}

export default function Observer(props: ObserverProps) {
  const ref = React.createRef<HTMLDivElement>();

  React.useEffect(() => {
    const obs = new IntersectionObserver((entries, obs) => {
      const entry = entries[0];
      const target = entry.target;

      if (entry.isIntersecting) {
        props.callback(target.children[0]);
        obs.unobserve(target);
      }
    });

    obs.observe(ref.current as Element);

    return () => obs.disconnect();
  }, [props]);

  return (
    <div className={props.className} ref={ref}>
      {props.children}
    </div>
  );
}
