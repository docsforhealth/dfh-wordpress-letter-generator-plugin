import { Spinner } from '@wordpress/components';
import { select, subscribe, useDispatch } from '@wordpress/data';
import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { isEqual, throttle } from 'lodash';
import PropTypes from 'prop-types';
import * as Constants from 'src/js/constants';
import useMountedStatus from 'src/js/hook/use-mounted-status';

const tryUpdateErrors = throttle(
  (clientId, errorsAttrName, oldErrors, updateErrors) => {
    const blockAttrs = select(Constants.STORE_BLOCK_EDITOR).getBlockAttributes(
      clientId,
    );
    // If block with given clientId has been removed, then short circuit
    if (!blockAttrs) {
      return;
    }
    if (!isEqual(oldErrors, blockAttrs[errorsAttrName])) {
      updateErrors(blockAttrs[errorsAttrName]);
    }
  },
  250,
);

// Because of limitations with the `subscribe` method of WP's data package, props are only read
// on initial render to set up the subscription. For any changes to props, this component will need
// to be completely unmounted and remounted
export default function CustomBlockStatusWatcher({
  clientId,
  validMessage,
  errorsAttrName,
  lockSavingIfInvalid,
}) {
  // short circuit if component is not currently mounted
  const { isMounted } = useMountedStatus();
  if (!isMounted) {
    return null;
  }
  // 1. Use `null` as the initial value to enable a "Loading" state
  // 2. Also, initializing to an empty array reveals a potential BUG where resetting to an
  // empty array does NOT trigger a re-render to clear the rectified error
  const [errors, setErrors] = useState(null);
  // 1. `subscribe` is called on EVERY SINGLE STATE CHANGE GLOBALLY so need to aggressively rate limit
  // see https://stackoverflow.com/a/60907141
  // 2. An `unsubscribe` function is returned but MAY NOT BE USED, depending on the store
  // https://github.com/WordPress/gutenberg/tree/trunk/packages/data#subscribe
  useEffect(
    () => {
      // Update errors objects once before subscribing to future updates
      tryUpdateErrors(clientId, errorsAttrName, errors, setErrors);
      const unsubscribeFn = subscribe(() =>
        tryUpdateErrors(clientId, errorsAttrName, errors, setErrors),
      );
      return () => {
        unsubscribeFn();
        tryUpdateErrors.cancel();
      };
    },
    // Ensure that subscribe is only called ONCE instead of on every render
    [],
  );
  // `errors` is null prior to the `useEffect` hook running so this component is still initializing
  return errors === null ? (
    <div className="custom-block-status-loading">
      <Spinner />
      {__('Validating...', Constants.TEXT_DOMAIN)}
    </div>
  ) : (
    <>
      <CustomBlockStatusInfo validMessage={validMessage} errors={errors} />
      {lockSavingIfInvalid && (
        <LockPostSavingIfInvalid isValid={!errors?.length} />
      )}
    </>
  );
}
CustomBlockStatusWatcher.propTypes = {
  clientId: PropTypes.string.isRequired,
  validMessage: PropTypes.string.isRequired,
  errorsAttrName: PropTypes.string.isRequired,
  lockSavingIfInvalid: PropTypes.bool,
};

export function LockPostSavingIfInvalid({ isValid }) {
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

export function CustomBlockStatusInfo({ validMessage, errors }) {
  return errors?.length ? (
    <div className="custom-block-status-info custom-block-status-info--invalid">
      <h3 className="custom-block-status-info__title">
        {__('Errors', Constants.TEXT_DOMAIN)}
      </h3>
      <ol>
        {errors.map((errorMessage, index) => (
          <li key={index}>{errorMessage}</li>
        ))}
      </ol>
    </div>
  ) : (
    <div className="custom-block-status-info">{validMessage}</div>
  );
}
CustomBlockStatusInfo.propTypes = {
  validMessage: PropTypes.string.isRequired,
  errors: PropTypes.arrayOf(PropTypes.string).isRequired,
};
