import PropTypes from 'prop-types';
import * as Constants from 'src/js/constants';
import { tryChildrenAsFunction } from 'src/js/utils/component';
import { slotName } from 'src/js/utils/data-element';

export const SLOT_CONTROLS_SECONDARY = `${Constants.NAMESPACE}/data-element/controls-secondary`;
export const SLOT_CONTROLS_TOGGLES = `${Constants.NAMESPACE}/data-element/controls-toggles`;
export const SLOT_HEADER = `${Constants.NAMESPACE}/data-element/header`;
export const SLOT_HELP_OVERLAY = `${Constants.NAMESPACE}/data-element/help-text-overlay`;
export const SLOT_HELP_TRIGGER = `${Constants.NAMESPACE}/data-element/help-text-trigger`;
export const SLOT_OVERLAY = `${Constants.NAMESPACE}/data-element/overlay`;
export const SLOT_INFO = `${Constants.NAMESPACE}/data-element/info`;

export default function Contents({ clientId, forceHide, children }) {
  // Hide the contents via CSS instead of removing from DOM beacuse the Fills are in `children`
  // So if we remove the contents here, will result in an infinite rendering loop
  return (
    <div
      className={`data-element__contents ${
        forceHide ? 'data-element__contents--hidden' : ''
      }`}
    >
      {tryChildrenAsFunction(children, {
        headerSlotName: slotName(SLOT_HEADER, clientId),
        helpOverlaySlotName: slotName(SLOT_HELP_OVERLAY, clientId),
        helpTriggerSlotName: slotName(SLOT_HELP_TRIGGER, clientId),
        infoSlotName: slotName(SLOT_INFO, clientId),
        overlaySlotName: slotName(SLOT_OVERLAY, clientId),
        secondaryControlsSlotName: slotName(SLOT_CONTROLS_SECONDARY, clientId),
        togglesSlotName: slotName(SLOT_CONTROLS_TOGGLES, clientId),
      })}
    </div>
  );
}
Contents.propTypes = {
  clientId: PropTypes.string.isRequired,
  forceHide: PropTypes.bool,
  children: PropTypes.oneOfType([PropTypes.func, PropTypes.node]),
};
