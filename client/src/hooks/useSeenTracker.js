import { useEffect, useRef } from 'react';

const useSeenTracker = (postId, onSeen, delay = 10000) => {
  const ref = useRef(null);
  const timer = useRef(null);
  const seen = useRef(false);

  useEffect(() => {
    const element = ref.current;

    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !seen.current) {
          timer.current = setTimeout(() => {
            seen.current = true;
            onSeen(postId);
          }, delay);
        } else {
          clearTimeout(timer.current);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(element);

    return () => {
      clearTimeout(timer.current);
      if (element) observer.unobserve(element);
    };
  }, [postId, delay, onSeen]);

  return ref;
};

export default useSeenTracker;