import { isFunction } from 'lodash';
import PropTypes from 'prop-types';
import * as Constants from 'src/js/constants';
import { slotName } from 'src/js/utils/data-element';

export const SLOT_OVERLAY = `${Constants.NAMESPACE}/data-element/overlay`;
export const SLOT_HEADER = `${Constants.NAMESPACE}/data-element/header`;
export const SLOT_CONTROLS_TOGGLES = `${Constants.NAMESPACE}/data-element/controls-toggles`;
export const SLOT_CONTROLS_SECONDARY = `${Constants.NAMESPACE}/data-element/controls-secondary`;
export const SLOT_HELP_OVERLAY = `${Constants.NAMESPACE}/data-element/help-text`;

export default function Contents({ clientId, forceHide, children }) {
  // Hide the contents via CSS instead of removing from DOM beacuse the Fills are in `children`
  // So if we remove the contents here, will result in an infinite rendering loop
  return (
    <div
      className={`data-element__contents ${
        forceHide ? 'data-element__contents--hidden' : ''
      }`}
    >
      {isFunction(children)
        ? children({
            overlaySlotName: slotName(SLOT_OVERLAY, clientId),
            headerSlotName: slotName(SLOT_HEADER, clientId),
            togglesSlotName: slotName(SLOT_CONTROLS_TOGGLES, clientId),
            secondaryControlsSlotName: slotName(
              SLOT_CONTROLS_SECONDARY,
              clientId,
            ),
            helpOverlaySlotName: slotName(SLOT_HELP_OVERLAY, clientId),
          })
        : children}
    </div>
  );
}
Contents.propTypes = {
  clientId: PropTypes.string.isRequired,
  forceHide: PropTypes.bool,
  children: PropTypes.oneOfType([PropTypes.func, PropTypes.node]),
};
