import {
  INFO as IMAGE_INFO,
  validateBlockInfo as validateImageBlockInfo,
} from 'src/js/block/helper/data-element-image';
import {
  INFO as OPTIONS_INFO,
  validateBlockInfo as validateOptionsBlockInfo,
} from 'src/js/block/helper/data-element-options';
import {
  INFO as TEXT_INFO,
  validateBlockInfo as validateTextBlockInfo,
} from 'src/js/block/helper/data-element-text';

/**
 * Determines if a given data element block info is valid
 * @param  {Object}  blockInfo Block info from block edior
 * @return {Array}             Array of error messages
 */
export function validateDataElement(blockInfo) {
  let errors = [];
  switch (blockInfo?.name) {
    case IMAGE_INFO.type:
      errors = validateImageBlockInfo(blockInfo);
      break;
    case OPTIONS_INFO.type:
      errors = validateOptionsBlockInfo(blockInfo);
      break;
    case TEXT_INFO.type:
      errors = validateTextBlockInfo(blockInfo);
      break;
  }
  return errors;
}
