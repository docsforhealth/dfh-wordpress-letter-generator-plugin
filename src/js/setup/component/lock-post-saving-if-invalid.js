import { select, useDispatch } from '@wordpress/data';
import { useEffect } from '@wordpress/element';
import PropTypes from 'prop-types';
import * as Constants from 'src/js/constants';

export default function LockPostSavingIfInvalid({ isValid }) {
  const { lockPostSaving, unlockPostSaving } = useDispatch(
    Constants.STORE_POST_EDITOR,
  );
  useEffect(() => {
    // Check if post saving is locked WITHIN the `useEffect` hook to avoid having to add it to
    // the dependency array, which results in occasional infinite update
    // see https://reactjs.org/docs/hooks-faq.html#what-can-i-do-if-my-effect-dependencies-change-too-often
    // see https://stackoverflow.com/questions/53070970/infinite-loop-in-useeffect
    const isSavingLocked = select(
      Constants.STORE_POST_EDITOR,
    )?.isPostSavingLocked();
    if (isValid && isSavingLocked === true) {
      unlockPostSaving();
    } else if (!isValid && isSavingLocked === false) {
      // BUG: locking post saving doesn't disable Publish button in block setings header
      // Only the second Publish button in the pre-publish panel is disabled
      lockPostSaving();
    }
  }, [isValid]);
  return null;
}
LockPostSavingIfInvalid.propTypes = {
  isValid: PropTypes.bool.isRequired,
};
