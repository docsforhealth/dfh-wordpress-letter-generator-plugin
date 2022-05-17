import { __ } from '@wordpress/i18n';
import { flatten, map } from 'lodash';
import * as Constants from 'src/js/constants';
import { ATTR_KEY, ATTR_LABEL } from 'src/js/constants/data-element';
import { getTitleFromBlockName } from 'src/js/utils/block';
import { getShapeDataElementBlocks } from 'src/js/utils/data-element';

/**
 * Determines if a given data element block info is valid
 * @param  {Object}  blockInfo Block info from block edior
 * @return {Array}             Array of error messages
 */
export function validateDataElement(blockInfo) {
  const errors = validateBaseBlockInfo(blockInfo);
  if (blockInfo?.name === Constants.BLOCK_DATA_ELEMENT_OPTIONS) {
    errors.push(...validateOptionsShape(blockInfo));
  }
  return errors;
}

/**
 * Build the dependencies array for timing when validation should be re-run
 * @param  {Object}  blockInfo Block info from block edior
 * @return {Array}             Array of dependency values
 */
export function validateDataElementDependencyString(blockInfo) {
  const deps = depsForBaseBlockValidation(blockInfo);
  if (blockInfo?.name === Constants.BLOCK_DATA_ELEMENT_OPTIONS) {
    deps.push(...depsForOptionsShapeValidation(blockInfo));
  }
  // Join all dependencies into a single string because the size of the dependency array must remain
  // consistent across renders!
  return deps.join('');
}

// ***********
// * Helpers *
// ***********

// Given the block type obtained from the `core/block-editor` store, determines if this block is valid
// This is the default implementation that blocks can leverage if desired.
export function validateBaseBlockInfo(blockInfo) {
  const blockTitle = getTitleFromBlockName(blockInfo?.name);
  const errors = [];
  if (!blockInfo?.attributes?.[ATTR_LABEL]) {
    errors.push(
      __('Please specify a label for', Constants.TEXT_DOMAIN) +
        ' ' +
        blockTitle,
    );
  }
  if (!blockInfo?.attributes?.[ATTR_KEY]) {
    errors.push(
      __('Missing a unique key for', Constants.TEXT_DOMAIN) + ' ' + blockTitle,
    );
  }
  return errors;
}
export function depsForBaseBlockValidation(blockInfo) {
  return [
    blockInfo?.attributes?.[ATTR_LABEL],
    blockInfo?.attributes?.[ATTR_KEY],
  ];
}

export function validateOptionsShape(blockInfo) {
  const shapeDataElementBlocks = getShapeDataElementBlocks(blockInfo?.clientId);
  if (shapeDataElementBlocks.length) {
    // If FIRST ELEMENT within inner blocks array exists, then check its validity
    // For this options data element to be valid, we only need at least one shape block to be valid
    // Assume that all inner blocks are `BLOCK_DATA_ELEMENT_TEXT`, which uses the base block validation
    return flatten(map(shapeDataElementBlocks, validateBaseBlockInfo));
  } else {
    return [
      __(
        'Please specify at least one option data attribute',
        Constants.TEXT_DOMAIN,
      ),
    ];
  }
}
export function depsForOptionsShapeValidation(blockInfo) {
  const shapeDataElementBlocks = getShapeDataElementBlocks(blockInfo?.clientId),
    deps = [shapeDataElementBlocks.length];
  if (shapeDataElementBlocks.length) {
    deps.push(
      ...flatten(map(shapeDataElementBlocks, depsForBaseBlockValidation)),
    );
  }
  return deps;
}
