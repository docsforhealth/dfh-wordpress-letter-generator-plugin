import { find, forEach, includes, isEmpty, map, startsWith } from 'lodash';
import pickBy from 'lodash.pickby';

const PREFIX_API_CONFIG = '_API_CONFIG';

// *****************
// * Hidden fields *
// *****************

const PREFIX_IGNORE = '_API_IGNORE_';

// Takes an array of attribute names to ignore. Main use case is for WP reserved attributes used
// for configuration (such as the `lock` attribute for block-level locking) that we can't use
// `markAttrHiddenInApi` on
export const API_CONFIG_IGNORED_ATTRIBUTES = `${PREFIX_API_CONFIG}_IGNORED_ATTRIBUTES_`;

/**
 * Mark attribute as hidden in the REST API
 * @param  {String} attrName Name of the attribute to mark
 * @return {String}          Marked name of the attribute
 */
export function markAttrHiddenInApi(attrName) {
  return `${PREFIX_IGNORE}${attrName}`;
}

// ************************
// * Handling InnerBlocks *
// ************************

// Sets the `innerBlocks` property to the provided string attribute name
export const API_CONFIG_INNER_BLOCKS_HAS_MANY = `${PREFIX_API_CONFIG}_INNER_BLOCKS_HAS_MANY_`;
// Expects an object where
//    - each key is the block name to look for
//    - each value is an object with `type` and `attributeName` keys
//        - `type` defines how this child inner block should be displayed
//        - `attributeName` is the attribute name to use to display the found block's data
//        - `childAttributeName` is only used when the type is `NESTED_HAS_MANY_TYPE_CHILD_ATTRIBUTE`
//        and specifies the child attribute that should be used
export const API_CONFIG_INNER_BLOCKS_NESTED_HAS_MANY = `${PREFIX_API_CONFIG}_INNER_BLOCKS_NESTED_HAS_MANY_`;

// Use all of the child both's data
const NESTED_HAS_MANY_TYPE_ALL = 'all';
// Use the child block's inner block's array
const NESTED_HAS_MANY_TYPE_CHILD_INNER_BLOCKS = 'childInnerBlocks';
// Use a specific attribute of child block
const NESTED_HAS_MANY_TYPE_CHILD_ATTRIBUTE = 'childAttribute';

const CHILD_BLOCK_OPERATION_TYPE = 'type';
const CHILD_BLOCK_OPERATION_ATTR_NAME = 'attributeName';
const CHILD_BLOCK_OPERATION_CHILD_ATTR_NAME = 'childAttributeName';

/**
 * Use with `API_CONFIG_INNER_BLOCKS_NESTED_HAS_MANY` as the coresponding value for a child block
 * name key when you want all the child block's data to be show
 * @param  {String} apiAttrName Name the attribute should have on the resulting top-level API object
 * @return {Object}             Returned configuration object
 */
export function useAllChildData(apiAttrName) {
  return {
    [CHILD_BLOCK_OPERATION_TYPE]: NESTED_HAS_MANY_TYPE_ALL,
    [CHILD_BLOCK_OPERATION_ATTR_NAME]: apiAttrName,
  };
}

/**
 * Use with `API_CONFIG_INNER_BLOCKS_NESTED_HAS_MANY` as the coresponding value for a child block
 * name key when you want only the child block's inner blocks to be shown
 * @param  {String} apiAttrName Name the attribute should have on the resulting top-level API object
 * @return {Object}             Returned configuration object
 */
export function useChildInnerBlocks(apiAttrName) {
  return {
    [CHILD_BLOCK_OPERATION_TYPE]: NESTED_HAS_MANY_TYPE_CHILD_INNER_BLOCKS,
    [CHILD_BLOCK_OPERATION_ATTR_NAME]: apiAttrName,
  };
}

/**
 * Use with `API_CONFIG_INNER_BLOCKS_NESTED_HAS_MANY` as the coresponding value for a child block
 * name key when you want only a specific child block attribute to be shown
 * @param  {String} apiAttrName   Name the attribute should have on the resulting top-level API object
 * @param  {String} childAttrName Name of the child block attribute whose value should be in the API
 * @return {Object}               Returned configuration object
 */
export function useChildAttribute(apiAttrName, childAttrName) {
  return {
    [CHILD_BLOCK_OPERATION_TYPE]: NESTED_HAS_MANY_TYPE_CHILD_ATTRIBUTE,
    [CHILD_BLOCK_OPERATION_ATTR_NAME]: apiAttrName,
    [CHILD_BLOCK_OPERATION_CHILD_ATTR_NAME]: childAttrName,
  };
}

// ****************************
// * Building API data object *
// ****************************

export const API_CONFIG_API_DATA = `${PREFIX_API_CONFIG}_API_DATA_`;

/**
 * Builds the API data object for the given blockInfo object returned by `store/block-editor`
 * Use JS to build API data instead of doing on the PHP side to leverage ability to use same set
 * of constants. Also, PHP `parse_blocks` is ignores default values by design.
 * See https://github.com/WordPress/gutenberg/issues/7342
 * @param  {Object} blockInfo Block info object in the format returned by `store/block-editor`
 * @return {Object}           API data object
 */
export function buildApiData(blockInfo) {
  if (isEmpty(blockInfo)) {
    return {};
  }
  const attrObj = blockInfo.attributes ?? {},
    shouldIgnoreAttrs = attrObj[API_CONFIG_IGNORED_ATTRIBUTES] ?? [],
    innerBlocks = blockInfo.innerBlocks ?? [];
  const data = pickBy(
    attrObj,
    (attrVal, attrName) =>
      !startsWith(attrName, PREFIX_IGNORE) &&
      !startsWith(attrName, PREFIX_API_CONFIG) &&
      !includes(shouldIgnoreAttrs, attrName),
  );
  // Set this block's inner blocks at the provided key name
  if (!isEmpty(attrObj[API_CONFIG_INNER_BLOCKS_HAS_MANY])) {
    data[attrObj[API_CONFIG_INNER_BLOCKS_HAS_MANY]] = map(
      innerBlocks,
      buildApiData,
    );
  }
  // Seek out the provided block name keys and perform the operations as defined by each key's value
  if (!isEmpty(attrObj[API_CONFIG_INNER_BLOCKS_NESTED_HAS_MANY])) {
    forEach(
      attrObj[API_CONFIG_INNER_BLOCKS_NESTED_HAS_MANY],
      (operation, blockName) => {
        const childBlock = find(innerBlocks, ['name', blockName]);
        if (!childBlock) {
          return;
        }
        const apiAttrName = operation[CHILD_BLOCK_OPERATION_ATTR_NAME];
        switch (operation[CHILD_BLOCK_OPERATION_TYPE]) {
          case NESTED_HAS_MANY_TYPE_ALL:
            data[apiAttrName] = buildApiData(childBlock);
            break;
          case NESTED_HAS_MANY_TYPE_CHILD_INNER_BLOCKS:
            data[apiAttrName] = map(childBlock.innerBlocks, buildApiData);
            break;
          case NESTED_HAS_MANY_TYPE_CHILD_ATTRIBUTE:
            data[apiAttrName] =
              childBlock.attributes[
                operation[CHILD_BLOCK_OPERATION_CHILD_ATTR_NAME]
              ];
            break;
        }
      },
    );
  }
  return data;
}
