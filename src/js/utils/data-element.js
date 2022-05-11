import { every } from 'lodash';
import PropTypes from 'prop-types';

/**
 * Reconciles which controls should be visible when specified in both attribute and via context.
 * Visible controls specified via attributes overrides those provided by context
 * @param  {Array} visibleAttributes Array of control names to show in the block's attributes
 * @param  {Array} visibleContext    Array of control names to show passed via context
 * @return {Array}                   Reconciled array
 */
export function reconcileVisibleAttrsAndContext(
  visibleAttributes,
  visibleContext,
) {
  return visibleAttributes ?? visibleContext;
}

/**
 * Given an array of control names that should be visible and an array of controls to check,
 * determines if the controls to check should be visible or not. Allows programmatic control of
 * which controls are displayed in the editor
 * @param  {Array}    visibleControls Array of control names to show
 * @param  {...String} attrsToCheck   Array of control names to check
 * @return {Boolean}                  Whether or not the controls to check should be shown
 */
export function shouldShowControl(visibleControls, ...attrsToCheck) {
  return (
    !visibleControls ||
    every(attrsToCheck, (attr) => visibleControls.includes(attr))
  );
}

/**
 * Builds a PropType validator for the attribute objects expected by the data-element helper components
 * @param  {PropType}  valuePropType PropType of the value itself
 * @param  {Boolean} isRequired      Whether the returned attribute PropType should be required
 * @return {PropType}                PropType validator for the attribute object
 */
export function buildAttrPropType(valuePropType, isRequired) {
  const attrPropType = PropTypes.shape({
    value: valuePropType,
    shouldShow: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
  });
  return isRequired ? attrPropType.isRequired : attrPropType;
}

/**
 * Builds a String for the name of the slot
 * @param  {String} root     String root for the slot name
 * @param  {String} clientId Client id of the block
 * @return {String}          Slot name
 */
export function slotName(root, clientId) {
  return `${root}-${clientId}`;
}
