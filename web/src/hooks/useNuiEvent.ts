import { useEffect, useRef } from 'react';

interface NuiMessage<T = unknown> {
  action: string;
  data?: T;
}

export function useNuiEvent<T = unknown>(action: string, handler: (data: T) => void): void {
  const savedHandler = useRef(handler);

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    const eventListener = (event: MessageEvent<NuiMessage<T>>) => {
      const { action: eventAction, data } = event.data;
      if (eventAction === action) {
        savedHandler.current(data as T);
      }
    };

    window.addEventListener('message', eventListener);
    return () => window.removeEventListener('message', eventListener);
  }, [action]);
}
