import {useCallback, useRef} from 'react';

function useDebounce(func, wait) {
  const debounceTimeout = useRef(null);

  const debouncedFunction = useCallback(
    (...args) => {
      clearTimeout(debounceTimeout.current);
      debounceTimeout.current = setTimeout(() => func(...args), wait);
    },
    [func, wait],
  );

  return debouncedFunction;
}

export default useDebounce;
