"use client";

import * as React from "react";

export function useInView<T extends HTMLElement = HTMLDivElement>(
  options?: IntersectionObserverInit
) {
  const ref = React.useRef<T>(null);
  const [isInView, setIsInView] = React.useState(false);

  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.25, ...options }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [options?.root, options?.rootMargin, options?.threshold]);

  return { ref, isInView };
}
