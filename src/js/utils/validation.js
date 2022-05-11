import { validateBlockInfo as validateOptionsBlockInfo } from 'src/js/block/helper/data-element-options';
import { validateBlockInfo } from 'src/js/block/shared/data-element';
import * as Constants from 'src/js/constants';

/**
 * Determines if a given data element block info is valid
 * @param  {Object}  blockInfo Block info from block edior
 * @return {Array}             Array of error messages
 */
export function validateDataElement(blockInfo) {
  let errors = [];
  switch (blockInfo?.name) {
    case Constants.BLOCK_DATA_ELEMENT_IMAGE:
    case Constants.BLOCK_DATA_ELEMENT_TEXT:
      errors = validateBlockInfo(blockInfo);
      break;
    case Constants.BLOCK_DATA_ELEMENT_OPTIONS:
      errors = validateOptionsBlockInfo(blockInfo);
      break;
  }
  return errors;
}
