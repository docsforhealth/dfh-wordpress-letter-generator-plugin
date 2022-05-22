import { useSelect } from '@wordpress/data';
import { useMemo } from '@wordpress/element';
import { addFilter } from '@wordpress/hooks';
import { map } from 'lodash';
import DataElementCompletion from 'src/js/component/data-element-completion';
import * as Constants from 'src/js/constants';
import { OPTION_COMBO_KEY } from 'src/js/constants/data-element';
import useSharedElementApiData from 'src/js/hook/use-shared-element-api-data';
import {
  buildSharedDataOptions,
  getLocalDataOptions,
} from 'src/js/utils/data-element';

export const TRIGGER_PREFIX = '#';

// docs https://github.com/WordPress/gutenberg/tree/trunk/packages/components/src/autocomplete
// `user` completer: https://github.com/WordPress/gutenberg/blob/b9203cab6d02c76996c617160cd02960f995f3bb/packages/editor/src/components/autocompleters/user.js
// `block` completer: https://github.com/WordPress/gutenberg/blob/2db0d5c100c6560915e53384beb2f51ed7180c34/packages/block-editor/src/autocompleters/block.js
const dataElementCompleter = {
  name: Constants.AUTOCOMPLETE_DATA_ELEMENT,
  triggerPrefix: TRIGGER_PREFIX,
  // This class is applied to the `button` used in the popover autocomplete menu that wraps the
  // React element in the `label` property of the completer options returned by `useItems`
  className: 'data-element-completion-menu-item',
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
    const [sharedElementApiData, isSharedFetchDone] = useSharedElementApiData(
        { search: filteredValue },
        [filteredValue],
      ),
      localOptions = useSelect(
        (select) => getLocalDataOptions({ search: filteredValue }, select),
        [filteredValue],
      );
    // Completer options MUST be REFERENTIALLY STABLE ACROSS RENDERS. Returning a new array each
    // render will result in an infinite loop as this array is used as a dependency downstream
    const options = useMemo(() => {
      const sharedOptions = isSharedFetchDone
        ? buildSharedDataOptions(sharedElementApiData)
        : [];
      // Convert options to completer items, show local items before shared items
      return map([...localOptions, ...sharedOptions], optionsToCompleterItem);
    }, [sharedElementApiData, isSharedFetchDone, localOptions]);
    // Note expected return value is AN ARRAY OF AN ARRAY. Nested `options` array must be
    // referentially stable across renders
    return [options];
  },
  // Inserting completion into text should replace trigger text with the specified `value`
  getOptionCompletion(option, filteredVal) {
    return <DataElementCompletion {...option} />;
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
 * Converts OptionInfo objects to the item form expected by the Autocomplete API
 * @param  {Object} option OptionInfo object
 * @return {Object}        Object in the form expected by the Autocomplete API
 */
function optionsToCompleterItem(option) {
  return option
    ? {
        key: option[OPTION_COMBO_KEY],
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
  return <DataElementCompletion.MenuItem {...option} />;
}
