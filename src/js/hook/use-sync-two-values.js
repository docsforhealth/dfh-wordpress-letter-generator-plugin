import { useEffect, useRef } from '@wordpress/element';
import { debounce } from 'lodash';

const trySyncTwoValues = debounce(
  (oldOne, oldTwo, newOne, newTwo, updateOne, updateTwo) => {
    // Don't check for empty values because we do not want to prevent users from clearing
    // if label has changed from prior version, then update post title
    if (newOne !== oldOne && newOne !== newTwo) {
      updateTwo(newOne);
    }
    // if post title has changed from prior version, then update label
    else if (newTwo !== oldTwo && newTwo !== newOne) {
      updateOne(newTwo);
    }
  },
  200,
);

/**
 * Synchronizes two values based on which one changed the last. If both values have changed,
 * preference will be given to the first value
 * @param  {Any} valueOne            First value
 * @param  {Any} valueTwo            Second value
 * @param  {Function} updateValueOne Function to update the first value
 * @param  {Function} updateValueTwo Function to update the second value
 */
export default function useSyncTwoValues(
  valueOne,
  valueTwo,
  updateValueOne,
  updateValueTwo,
) {
  const cachedValueOneObj = useRef(valueOne),
    cachedValueTwoObj = useRef(valueTwo);
  const updateCachedValues = (newValue) => {
      cachedValueOneObj.current = newValue;
      cachedValueTwoObj.current = newValue;
    },
    updateValueOneAndCache = (newTwo) => {
      updateValueOne(newTwo);
      updateCachedValues(newTwo);
    },
    updateValueTwoAndCache = (newOne) => {
      updateValueTwo(newOne);
      updateCachedValues(newOne);
    };
  useEffect(() => {
    trySyncTwoValues(
      cachedValueOneObj.current,
      cachedValueTwoObj.current,
      valueOne,
      valueTwo,
      updateValueOneAndCache,
      updateValueTwoAndCache,
    );
    return trySyncTwoValues.cancel;
  }, [valueOne, valueTwo]);
}
