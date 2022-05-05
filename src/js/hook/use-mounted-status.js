import { useEffect, useState } from '@wordpress/element';

// 1. Track React mounted state to avoid memory leak error
// see: https://jasonwatmore.com/post/2021/08/27/react-how-to-check-if-a-component-is-mounted-or-unmounted
// 2. One change is that we set initial value to `true` because the `useEffect` hook
// fires after all rendering is completed and we neeed this value to be true for the initial render
export default function useMountedStatus(startMounted = true) {
  const [mountedStatus] = useState({ isMounted: startMounted });
  useEffect(
    () => () => (mountedStatus.isMounted = false),
    // ensure that `useEffect` only fires once, default is fire on every render
    // see https://reactjs.org/docs/hooks-reference.html#conditionally-firing-an-effect
    [],
  );
  return mountedStatus;
}
