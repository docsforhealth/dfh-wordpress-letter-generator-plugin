import { startsWith } from 'lodash';
import * as Constants from 'src/js/constants';

/**
 * Mark attribute as hidden in the REST API
 * @param  {String} attrName Name of the attribute to mark
 * @return {String}          Marked name of the attribute
 */
export function markAttrHiddenInApi(attrName) {
  return `${Constants.ATTR_HIDE_API_PREFIX}${attrName}`;
}

/**
 * Checks to see if attribute should be shown in the REST API
 * @param  {String} attrNameToCheck Name of the attribute to check
 * @return {boolean}                Whether or not the attribute should be shown
 */
export function shouldShowAttrInApi(attrNameToCheck) {
  return startsWith(attrNameToCheck, Constants.ATTR_HIDE_API_PREFIX);
}
