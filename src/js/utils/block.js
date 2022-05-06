import { getBlockType, registerBlockType } from '@wordpress/blocks';
import { select } from '@wordpress/data';
import { filter } from 'lodash';
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
 * Return inner blocks objects given block clientId
 * @param  {String} clientId Block identifier to count inner blocks for
 * @return {Array}           Array of inner blocks objects if found
 */
export function getInnerBlocks(clientId) {
  return clientId
    ? select(Constants.STORE_BLOCK_EDITOR)?.getBlock(clientId)?.innerBlocks ??
        []
    : [];
}

/**
 * Count number of inner blocks given block clientId
 * @param  {String} clientId Block identifier to count inner blocks for
 * @return {Integer}         Number of inner block children
 */
export function countInnerBlocks(clientId) {
  return getInnerBlocks(clientId).length;
}

/**
 * Given the block name, return the block title
 * @param  {Object} blockName The block's name, for example `dfh/text`
 * @return {String}           The block's title
 */
export function getTitleFromBlockName(blockName) {
  return blockName ? getBlockType(blockName)?.title : '';
}

/**
 * Conducts a breadth-first search through blocks for the first occurrence of the block name
 * @param  {String} blockName       Name of the block to look for
 * @param  {?String} parentClientId Optional, client id to start the search from. If absent will
 *                                  start search at the root of the block tree
 * @return {Object}                 Found block's editor object
 */
export function tryFindBlockInfoFromName(blockName, parentClientId = null) {
  const { getBlock, getBlocks } = select(Constants.STORE_BLOCK_EDITOR),
    blocks = filter([
      ...(parentClientId ? getBlock(parentClientId) : getBlocks() ?? []),
    ]);
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
