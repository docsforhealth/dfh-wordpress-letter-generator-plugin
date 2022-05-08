import { useDispatch, useSelect } from '@wordpress/data';
import { useCallback } from '@wordpress/element';
import * as Constants from 'src/js/constants';
import { countInnerBlocks } from 'src/js/utils/block';

/**
 * Returns a function that takes a new block to insert within the specified `clientId`
 * @param  {String} clientId Client ID of the block to insert within
 * @return {Function}        A function that takes in a block to insert within the found block
 */
export default function useInsertBlock(clientId) {
  // will fire on every render because no clear dependency
  const numElements = useSelect((select) => countInnerBlocks(clientId, select));
  const { insertBlock } = useDispatch(Constants.STORE_BLOCK_EDITOR);
  // 1. inspired by https://github.com/WordPress/gutenberg/blob/trunk/packages/block-editor/src/components/inserter/index.js
  // 2. inability to undo after inserting certain blocks, known as the "undo trap." Still resolved
  // per https://github.com/WordPress/gutenberg/issues/8119.
  // 3. `wp.data.dispatch("core/editor").createUndoLevel` is a no-op and has been deprecated
  return useCallback(
    (block) => insertBlock(block, numElements, clientId),
    [numElements, clientId],
  );
}
