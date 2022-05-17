import { select } from '@wordpress/data';
import {
  endsWith,
  escapeRegExp,
  every,
  filter,
  flatten,
  forEach,
  map,
  memoize,
  some,
  startsWith,
  values,
} from 'lodash';
import PropTypes from 'prop-types';
import * as Constants from 'src/js/constants';
import {
  ATTR_KEY,
  ATTR_LABEL,
  ATTR_SHAPE_VALUE,
  ELEMENT_ATTR_BLOCK_NAME,
  ELEMENT_ATTR_COMBO_KEY,
  ELEMENT_ATTR_DATA_KEY,
  ELEMENT_ATTR_IS_SHARED,
  ELEMENT_ATTR_LABEL,
  ELEMENT_ATTR_OPTIONS_SHAPE_KEY,
  ELEMENT_ATTR_OPTIONS_SHAPE_LABEL,
  ELEMENT_ATTR_ORIGINAL_DISPLAY_LABEL,
  LABEL_SHARED_OPTION,
  OPTION_BLOCK_NAME,
  OPTION_COMBO_KEY,
  OPTION_DATA_KEY,
  OPTION_DISPLAY_LABEL,
  OPTION_IS_SHARED,
  OPTION_LABEL,
  OPTION_OPTIONS_SHAPE_KEY,
  OPTION_OPTIONS_SHAPE_LABEL,
  OPTION_TEXT_SPACER,
} from 'src/js/constants/data-element';
import { tryFindBlockInfoFromName } from 'src/js/utils/block';
import { dataAttributeToProperty } from 'src/js/utils/component';

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

/**
 * Find the `BLOCK_DATA_ELEMENT_OPTIONS_SHAPE` and retrieve its inner block
 * @param  {String} clientId Block client id to start the search from
 * @return {Array}           Array of inner block infos within the found shape block
 */
export function getShapeDataElementBlocks(clientId) {
  return (
    tryFindBlockInfoFromName(
      Constants.BLOCK_DATA_ELEMENT_OPTIONS_SHAPE,
      clientId,
    )?.innerBlocks ?? []
  );
}

/**
 * Parse `OPTION_IS_SHARED` into a boolean
 * @param  {String|Boolean} isShared Representation of `OPTION_IS_SHARED`
 * @return {Boolean}                 Boolean representation of `OPTION_IS_SHARED`
 */
export function parseOptionIsShared(isShared) {
  return isShared === true || isShared === 'true';
}

/**
 * Converts dataset from `DataElementCompletion` to OptionInfo
 * @param  {Object} dataset Camel-cased dataset properties
 * @return {Object}         OptionInfo object
 */
export function completionDatasetToOption(dataset) {
  const option = {};
  if (!dataset) {
    return option;
  }
  // common properties
  option[OPTION_COMBO_KEY] =
    dataset[dataAttributeToProperty(ELEMENT_ATTR_COMBO_KEY)];
  option[OPTION_DATA_KEY] =
    dataset[dataAttributeToProperty(ELEMENT_ATTR_DATA_KEY)];
  option[OPTION_DISPLAY_LABEL] =
    dataset[dataAttributeToProperty(ELEMENT_ATTR_ORIGINAL_DISPLAY_LABEL)];
  option[OPTION_LABEL] = dataset[dataAttributeToProperty(ELEMENT_ATTR_LABEL)];
  option[OPTION_IS_SHARED] = parseOptionIsShared(
    dataset[dataAttributeToProperty(ELEMENT_ATTR_IS_SHARED)],
  );
  option[OPTION_BLOCK_NAME] =
    dataset[dataAttributeToProperty(ELEMENT_ATTR_BLOCK_NAME)];
  // specific to options data elements
  if (option[OPTION_BLOCK_NAME] === Constants.BLOCK_DATA_ELEMENT_OPTIONS) {
    option[OPTION_OPTIONS_SHAPE_KEY] =
      dataset[dataAttributeToProperty(ELEMENT_ATTR_OPTIONS_SHAPE_KEY)];
    option[OPTION_OPTIONS_SHAPE_LABEL] =
      dataset[dataAttributeToProperty(ELEMENT_ATTR_OPTIONS_SHAPE_LABEL)];
  }
  return option;
}

/**
 * Retrieves shared data elements and converts to standardized OptionInfo format
 * @param  {?String} search     Optional, string to search for
 * @param  {?Function} mySelect Optional, `select` function
 * @return {Array}              Array of shared data elements as OptionInfo objects
 */
export function getSharedDataOptions(search = '', mySelect = null) {
  const thisSelect = mySelect ? mySelect : select,
    requestOptions = {
      context: Constants.API_CONTEXT_VIEW,
      status: Constants.POST_STATUS_PUBLISHED,
    };
  // when selecting shared data elements, leverage the built-in search functionality of the WP API
  if (search) {
    requestOptions.search = encodeURIComponent(search);
  }
  const dataElementsFromAPI =
    // 7. flatten into an array of data elements
    flatten(
      // 6. extract the 'innerBlocks' property to get the contained data element
      map(
        // 5. extract only the block infos for `BLOCK_SHARED_DATA_ELEMENT`
        filter(
          // 4. flatten array of arrays
          flatten(
            // 3. extract the values from each object in the array, yielding an array of arrays
            map(
              // 2. extract the custom `block_data` property, see `content_type_shared_data_element.php`
              //    NOTE: due to the PHP roots of the API, this is an array of OBJECTS each with
              //    NUMBERED KEYS
              map(
                // 1. select all the shared data element pages
                thisSelect(Constants.STORE_CORE_DATA).getEntityRecords(
                  Constants.ENTITY_KIND_POST_TYPE,
                  Constants.CONTENT_TYPE_SHARED_DATA_ELEMENT,
                  requestOptions,
                ),
                'block_data',
              ),
              values,
            ),
          ),
          ['blockName', Constants.BLOCK_SHARED_DATA_ELEMENT],
        ),
        'innerBlocks',
      ),
    );
  // Need to standardize API data to the same format as that returned by `store/block-editor`
  const standardizedDataElements = filter(
    map(dataElementsFromAPI, standardizeBlockInfoFromAPI),
  );
  // Then convert to OptionInfo form
  return flatten(
    map(standardizedDataElements, (el) => blockInfoToDataOption(el, true)),
  );
}

/**
 * Retrieves local data elements and converts to standardized OptionInfo format
 * @param  {?String} search     Optional, string to search for
 * @param  {?Function} mySelect Optional, `select` function
 * @param  {?String} clientId   Optional, client id to start searching from
 * @return {Array}              Array of local data elements as OptionInfo objects
 */
export function getLocalDataOptions(
  search = '',
  mySelect = null,
  clientId = null,
) {
  const thisSelect = mySelect ? mySelect : select;
  // Will start the breadth-first search for `BLOCK_LETTER_DATA_ELEMENTS`
  const localDataElements =
      tryFindBlockInfoFromName(
        Constants.BLOCK_LETTER_DATA_ELEMENTS,
        clientId,
        thisSelect,
      )?.innerBlocks ?? [],
    localDataOptions = flatten(
      map(localDataElements, (el) => blockInfoToDataOption(el, false)),
    );
  if (search) {
    const filteredRegex = buildRegexForSearch(search);
    return filter(localDataOptions, (option) =>
      some(getLocalOptionKeywords(option), (keyword) =>
        filteredRegex.test(keyword),
      ),
    );
  } else {
    return localDataOptions;
  }
}

// ***********
// * Helpers *
// ***********

/**
 * Builds key for an OptionInfo object
 * @param  {String} dataKey   Data element key
 * @param  {?String} shapeKey Optional, Key for the specific shape choice
 * @return {String}           Combo key for the OptionInfo object
 */
function buildDataOptionKey(dataKey, shapeKey = null) {
  return shapeKey ? `${dataKey}-${shapeKey}` : dataKey;
}

/**
 * Builds the display text for a data option for the data element custom format for `RichText`
 * We don't include the trigger prefix (`#`) in the option text so the autocomplete menu won't
 * trigger even if the text matches
 * @param  {String} label       Label of the data element
 * @param  {?String} shapeLabel Option, string of a particular choice if an options data element
 * @return {String}             Display text for a data option
 */
function buildDataOptionDisplayLabel(label, shapeLabel = null) {
  return ensureSpaceAroundDataOptionLabel(
    shapeLabel ? `${label} (${shapeLabel})` : label,
  );
}

/**
 * Ensures spacing around data option label. Do NOT using padding around badge to prevent
 * unintuitive cursor behavior. Therefore, need to ensure that the option text both starts and
 * ends with a space for adequate spacing
 * @param  {String} optionText String to display
 * @return {String}            New label with appropriate padding
 */
function ensureSpaceAroundDataOptionLabel(optionText) {
  let newOptionText = optionText;
  if (!startsWith(optionText, OPTION_TEXT_SPACER)) {
    newOptionText = OPTION_TEXT_SPACER + newOptionText;
  }
  if (!endsWith(optionText, OPTION_TEXT_SPACER)) {
    newOptionText = newOptionText + OPTION_TEXT_SPACER;
  }
  return newOptionText;
}

/**
 * Transforms the block info returned by the REST API into the format expected for this completer
 * NOTE: the block info returned via the REST API is NOT in the same form as the data returned
 * by the `core/block-editor` store
 * @param  {Object} restInfo Data returned by the REST API
 * @return {Object}          Data standardized to form returned by `core/block-editor` store
 */
function standardizeBlockInfoFromAPI(restInfo) {
  return restInfo
    ? { name: restInfo.blockName, attributes: restInfo.attrs }
    : null;
}

/**
 * Builds regex for searching local block options for autocomplete
 * Inspired by https://github.com/WordPress/gutenberg/blob/trunk/packages/components/src/autocomplete/get-default-use-items.js
 * @param  {String} search Search string to build regular expression for
 * @return {RegExp}        Compiled regular expression
 */
const buildRegexForSearch = memoize(
  (search) => new RegExp('(?:\b|s|^)' + escapeRegExp(search), 'i'),
);

/**
 * Generates an array of keywords for the provided local option for use in searching
 * @param  {Object} option OptionInfo object
 * @return {Array}         Array of keyword strings
 */
function getLocalOptionKeywords(option) {
  return filter([
    option[OPTION_LABEL],
    option[OPTION_OPTIONS_SHAPE_LABEL],
    option[OPTION_IS_SHARED] && LABEL_SHARED_OPTION,
  ]);
}

/**
 * Generates one or several OptionInfo objects given a block's info
 *
 * For text and image data elements, this will return an array with a single object of shape:
 * {
 *   [OPTION_DATA_KEY]: 'test1',
 *   [OPTION_DISPLAY_LABEL]: 'Patient name',
 *   [OPTION_LABEL]: 'Patient name',
 *   [OPTION_IS_SHARED]: false,
 *   [OPTION_BLOCK_NAME]: Constants.BLOCK_DATA_ELEMENT_TEXT,
 * }
 *
 * For options data elements, will return an array with several objects each of shape:
 * {
 *   [OPTION_DATA_KEY]: 'test2',
 *   [OPTION_DISPLAY_LABEL]: 'Pronoun (Subject)',
 *   [OPTION_LABEL]: 'Pronoun',
 *   [OPTION_IS_SHARED]: true,
 *   [OPTION_BLOCK_NAME]: Constants.BLOCK_DATA_ELEMENT_OPTIONS,
 *   [OPTION_OPTIONS_SHAPE_KEY]: 'subject',
 *   [OPTION_OPTIONS_SHAPE_LABEL]: 'Subject',
 * }
 * @param  {String}  options.name       Block's registered name, such as `dfh/text`
 * @param  {Object}  options.attributes Block's attributes
 * @param  {Boolean} isShared           Whether or not this is a shared or local data element
 * @return {Array}                      Array of OptionInfo objects
 */
function blockInfoToDataOption({ name, attributes }, isShared) {
  const options = [],
    sharedAttrs = {
      [OPTION_DATA_KEY]: attributes[ATTR_KEY],
      [OPTION_LABEL]: attributes[ATTR_LABEL],
      [OPTION_IS_SHARED]: isShared,
      [OPTION_BLOCK_NAME]: name,
    };
  if (name === Constants.BLOCK_DATA_ELEMENT_OPTIONS) {
    forEach(attributes[ATTR_SHAPE_VALUE], (shapeAttrs) =>
      options.push({
        ...sharedAttrs,
        [OPTION_OPTIONS_SHAPE_KEY]: shapeAttrs[ATTR_KEY],
        [OPTION_OPTIONS_SHAPE_LABEL]: shapeAttrs[ATTR_LABEL],
      }),
    );
  } else {
    options.push(sharedAttrs);
  }
  // Build display labels and combo keys  for all options
  options.forEach((option) => {
    option[OPTION_COMBO_KEY] = buildDataOptionKey(
      option[OPTION_DATA_KEY],
      option[OPTION_OPTIONS_SHAPE_KEY],
    );
    option[OPTION_DISPLAY_LABEL] = buildDataOptionDisplayLabel(
      option[OPTION_LABEL],
      option[OPTION_OPTIONS_SHAPE_LABEL],
    );
  });
  return options;
}
