import { getBlockType, registerBlockType } from '@wordpress/blocks';
import { select } from '@wordpress/data';
import { filter, memoize } from 'lodash';
import * as Constants from 'src/js/constants';

/**
 * Registers a new block type only if not already registered
 * @param  {String} blockName Name of block to register
 * @param  {Object} settings  Settings for the block to be registered
 */
export function tryRegisterBlockType(blockName, settings) {
  const existingType = getBlockType(blockName);
  if (!existingType) {
    registerBlockType(blockName, settings);
  }
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

/**
 * Return inner blocks objects given block clientId
 * @param  {String} clientId    Block identifier to count inner blocks for
 * @param  {?Function} mySelect Optional, user-provided `select` function
 * @return {Array}              Array of inner blocks objects if found
 */
export function getInnerBlocks(clientId, mySelect = null) {
  const thisSelect = mySelect ? mySelect : select;
  return clientId
    ? thisSelect(Constants.STORE_BLOCK_EDITOR)?.getBlock(clientId)
        ?.innerBlocks ?? []
    : [];
}

/**
 * Count number of inner blocks given block clientId
 * @param  {String} clientId    Block identifier to count inner blocks for
 * @param  {?Function} mySelect Optional, user-provided `select` function
 * @return {Integer}            Number of inner block children
 */
export function countInnerBlocks(clientId, mySelect = null) {
  return getInnerBlocks(clientId, mySelect).length;
}

/**
 * Removes namespace before block name
 * @param  {String} blockName Full block name with preceding namespace
 * @return {String}           Block name sans preceding namespace prefix and forward slash
 */
export function blockNameWithoutNamespace(blockName) {
  return blockName?.slice(Constants.NAMESPACE.length + 1);
}

/**
 * Restores namespace to block name without namespace
 * @param  {String} blockNameWithoutNamespace Block name sans preceding namespace prefix and forward slash
 * @return {String}                           Full block name with preceding namespace
 */
export function restoreBlockNameNamespace(blockNameWithoutNamespace) {
  return `${Constants.NAMESPACE}/${blockNameWithoutNamespace}`;
}

/**
 * Given the block name, return the block title
 * @param  {Object} blockName The block's name, for example `dfh/text`
 * @return {String}           The block's title
 */
export const getTitleFromBlockName = memoize((blockName) => {
  return blockName ? getBlockType(blockName)?.title : '';
});

/**
 * Given the block name, return the icon
 * @param  {Object} blockName The block's name, for example `dfh/text`
 * @return {Object|String}    Icon source
 */
export const getIconFromBlockName = memoize((blockName) => {
  return blockName ? getBlockType(blockName)?.icon?.src : null;
});

/**
 * Conducts a breadth-first search through blocks for the first occurrence of the block name
 * @param  {String} blockName       Name of the block to look for
 * @param  {?String} parentClientId Optional, client id to start the search from. If absent will
 *                                  start search at the root of the block tree
 * @param  {?Function} mySelect     Optional, user-provided `select` function
 * @return {Object}                 Found block's editor object
 */
export function tryFindBlockInfoFromName(
  blockName,
  parentClientId = null,
  mySelect = null,
) {
  const thisSelect = mySelect ? mySelect : select;
  const { getBlock, getBlocks } = thisSelect(Constants.STORE_BLOCK_EDITOR),
    blocks = filter(
      parentClientId ? [getBlock(parentClientId)] : [...(getBlocks() ?? [])],
    );
  let foundBlock = null;
  while (blocks.length) {
    const currentBlock = blocks.shift();
    if (currentBlock.name === blockName) {
      foundBlock = currentBlock;
      break;
    }
    blocks.push(...currentBlock.innerBlocks);
  }
  return foundBlock;
}
