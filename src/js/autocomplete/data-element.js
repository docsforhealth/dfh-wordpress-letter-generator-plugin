import { useSelect } from '@wordpress/data';
import { useMemo } from '@wordpress/element';
import { addFilter } from '@wordpress/hooks';
import {
  escapeRegExp,
  filter,
  flatten,
  forEach,
  map,
  some,
  values,
} from 'lodash';
import { ATTR_SHAPE_VALUE } from 'src/js/block/helper/data-element-options';
import { getOnlyDataElementsFromClientId } from 'src/js/block/helper/data-elements';
import { ATTR_KEY, ATTR_LABEL } from 'src/js/block/shared/data-element';
import DataElementOptionCompletion, {
  LABEL_SHARED,
  OPTION_IS_SHARED,
  OPTION_KEY,
  OPTION_LABEL,
  OPTION_OPTIONS_SHAPE_KEY,
  OPTION_OPTIONS_SHAPE_LABEL,
  OPTION_TYPE,
} from 'src/js/component/data-element-option-completion';
import * as Constants from 'src/js/constants';
import { tryFindBlockInfoFromName } from 'src/js/utils/block';

export const TRIGGER_PREFIX = '#';

// docs https://github.com/WordPress/gutenberg/tree/trunk/packages/components/src/autocomplete
// `user` completer: https://github.com/WordPress/gutenberg/blob/b9203cab6d02c76996c617160cd02960f995f3bb/packages/editor/src/components/autocompleters/user.js
// `block` completer: https://github.com/WordPress/gutenberg/blob/2db0d5c100c6560915e53384beb2f51ed7180c34/packages/block-editor/src/autocompleters/block.js
const dataElementCompleter = {
  name: Constants.AUTOCOMPLETE_DATA_ELEMENT,
  triggerPrefix: TRIGGER_PREFIX,
  // This class is applied to the `button` used in the popover autocomplete menu that wraps the
  // React element in the `label` property of the completer options returned by `useItems`
  className: 'data-element-option-menu-item',
  // Need to use the undocumented `useItems` property instead of the documented `options` property
  // in order to be able to use hooks. We cannot use hooks inside of `options` even if it is a function
  // because this will be called within `useLayoutEffect` hook, which violates the Rules of Hooks
  //
  // Using the documented `options` property uses WP's provided `get-default-use-items.js` which
  // creates a default `useItems` hook. If choosing to implement our own `useItems` hook, we only
  // need to specify `name`, `triggerPrefix`, `useItems`, and `getOptionCompletion`. We can also
  // optionally specify `className` that will be applied to the return option's `label`
  //
  // 1. calling `options` inside of `useLayoutEffect`: https://github.com/WordPress/gutenberg/blob/trunk/packages/components/src/autocomplete/get-default-use-items.js
  // 2. announcement of `useItems` in v8.5: https://make.wordpress.org/core/2020/07/08/whats-new-in-gutenberg-8-july/
  // 3. GitHub PR tracking `useItems`: https://github.com/WordPress/gutenberg/pull/22853
  // 4. where `useItems` is called: https://github.com/WordPress/gutenberg/blob/trunk/packages/components/src/autocomplete/autocompleter-ui.js
  // 5. `useItems` example: https://github.com/WordPress/gutenberg/blob/trunk/packages/editor/src/components/autocompleters/user.js
  useItems(filteredValue) {
    // when selecting shared data elements, leverage the built-in search functionality of the WP API
    const dataElementsFromAPI = useSelect(
      (select) =>
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
                    select(Constants.STORE_CORE_DATA).getEntityRecords(
                      Constants.ENTITY_KIND_POST_TYPE,
                      Constants.CONTENT_TYPE_SHARED_DATA_ELEMENT,
                      {
                        context: Constants.API_CONTEXT_VIEW,
                        status: Constants.POST_STATUS_PUBLISHED,
                        search: encodeURIComponent(filteredValue),
                      },
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
        ),
      [filteredValue],
    );
    // return all local data elements every time, will filter later on in the following hook
    const dataElementsFromLocal = useMemo(
      () =>
        getOnlyDataElementsFromClientId(
          tryFindBlockInfoFromName(Constants.BLOCK_DATA_ELEMENTS)?.clientId,
        ),
      [filteredValue],
    );
    // Completer options MUST be REFERENTIALLY STABLE ACROSS RENDERS. Returning a new array each
    // render will result in an infinite loop as this array is used as a dependency downstream
    const options = useMemo(() => {
      // Convert local blockInfo to standardized options format, then need to manually search
      // inspired by https://github.com/WordPress/gutenberg/blob/trunk/packages/components/src/autocomplete/get-default-use-items.js
      const filteredRegex = new RegExp(
          '(?:\b|s|^)' + escapeRegExp(filteredValue),
          'i',
        ),
        localOptions = filter(
          flatten(
            map(dataElementsFromLocal, (el) => blockInfoToOptions(el, false)),
          ),
          (option) =>
            some(getLocalOptionKeywords(option), (keyword) =>
              filteredRegex.test(keyword),
            ),
        );
      // First standardize API data to the same format as that returned by `store/block-editor`
      // Then convert this standardized blockInfo to the options format this completer expects
      // Searching has already been taken care of by the WP REST API call above
      const sharedOptions = flatten(
        map(
          filter(map(dataElementsFromAPI, standardizeBlockInfoFromAPI)),
          (el) => blockInfoToOptions(el, true),
        ),
      );
      // Convert options to completer items, show local items before shared items
      return map([...localOptions, ...sharedOptions], optionsToCompleterItem);
    }, [dataElementsFromAPI, dataElementsFromLocal]);
    // Note expected return value is AN ARRAY OF AN ARRAY. Nested `options` array must be
    // referentially stable across renders
    return [options];
  },
  // Inserting completion into text should replace trigger text with the specified `value`
  getOptionCompletion(option, filteredVal) {
    return <DataElementOptionCompletion {...option} />;
  },
};

// see https://developer.wordpress.org/block-editor/reference-guides/filters/autocomplete-filters/
addFilter(
  'editor.Autocomplete.completers',
  `${Constants.NAMESPACE}/autocomplete/data-element`,
  (completers, blockName) =>
    blockName === Constants.BLOCK_LETTER_CONTENT
      ? [...completers, dataElementCompleter]
      : completers,
);

// ***********
// * Helpers *
// ***********

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
 * Generates one or several OptionInfo objects given a block's info
 *
 * For text and image data elements, this will return an array with a single object of shape:
 * {
 *   [OPTION_KEY]: 'test1',
 *   [OPTION_LABEL]: 'Patient name',
 *   [OPTION_IS_SHARED]: false,
 *   [OPTION_TYPE]: Constants.BLOCK_DATA_ELEMENT_TEXT,
 * }
 *
 * For options data elements, will return an array with several objects each of shape:
 * {
 *   [OPTION_KEY]: 'test2',
 *   [OPTION_LABEL]: 'Pronoun',
 *   [OPTION_IS_SHARED]: true,
 *   [OPTION_TYPE]: Constants.BLOCK_DATA_ELEMENT_OPTIONS,
 *   [OPTION_OPTIONS_SHAPE_KEY]: 'subject',
 *   [OPTION_OPTIONS_SHAPE_LABEL]: 'Subject',
 * }
 * @param  {String}  options.name       Block's registered name, such as `dfh/text`
 * @param  {Object}  options.attributes Block's attributes
 * @param  {Boolean} isShared           Whether or not this is a shared or local data element
 * @return {Array}                      Array of OptionInfo objects
 */
function blockInfoToOptions({ name, attributes }, isShared) {
  const options = [],
    sharedAttrs = {
      [OPTION_KEY]: attributes[ATTR_KEY],
      [OPTION_LABEL]: attributes[ATTR_LABEL],
      [OPTION_IS_SHARED]: isShared,
      [OPTION_TYPE]: name,
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
  return options;
}

/**
 * Converts OptionInfo objects to the item form expected by the Autocomplete API
 * @param  {Object} option OptionInfo object
 * @return {Object}        Object in the form expected by the Autocomplete API
 */
function optionsToCompleterItem(option) {
  return option
    ? {
        key: option[OPTION_OPTIONS_SHAPE_KEY]
          ? `${option[OPTION_KEY]}-${option[OPTION_OPTIONS_SHAPE_KEY]}`
          : option[OPTION_KEY],
        value: option,
        label: getOptionLabel(option),
      }
    : {};
}

/**
 * Creates React element used to render this option in the Autocomplete popover menu
 * @param  {Object} option OptionInfo object
 * @return {Element}       React element that is wrapped in a `button` with the `className` specified above
 */
function getOptionLabel(option) {
  return <DataElementOptionCompletion.MenuItem {...option} />;
}

/**
 * Generates an array of keywords for the provided local option for use in searching
 * @param  {Object} option OptionInfo object
 * @return {Array}         Array of keyword strings
 */
function getLocalOptionKeywords(option) {
  return filter([
    option[OPTION_LABEL],
    option[OPTION_OPTIONS_SHAPE_LABEL],
    option[OPTION_IS_SHARED] && LABEL_SHARED,
  ]);
}
