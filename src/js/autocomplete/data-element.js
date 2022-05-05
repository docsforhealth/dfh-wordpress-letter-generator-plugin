import { addFilter } from '@wordpress/hooks';
import { filter } from 'lodash';
import DataElementOption, {
  LABEL_SHARED,
  OPTION_IS_SHARED,
  OPTION_KEY,
  OPTION_LABEL,
  OPTION_OPTIONS_SHAPE_KEY,
  OPTION_OPTIONS_SHAPE_LABEL,
  OPTION_TYPE,
} from 'src/js/component/data-element-option';
import * as Constants from 'src/js/constants';

export const TRIGGER_PREFIX = '#';

// docs https://github.com/WordPress/gutenberg/tree/trunk/packages/components/src/autocomplete
// `user` completer: https://github.com/WordPress/gutenberg/blob/b9203cab6d02c76996c617160cd02960f995f3bb/packages/editor/src/components/autocompleters/user.js
// `block` completer: https://github.com/WordPress/gutenberg/blob/2db0d5c100c6560915e53384beb2f51ed7180c34/packages/block-editor/src/autocompleters/block.js
const dataElementCompleter = {
  name: Constants.AUTOCOMPLETE_DATA_ELEMENT,
  triggerPrefix: TRIGGER_PREFIX,
  // This class is applied to the `button` used in the popover autocomplete menu that wraps the
  // return value of `getOptionLabel`
  className: 'data-element-option-menu-item',
  isDebounced: true,
  // TODO selecting local and shared data elements
  // TODO convert to function
  // see https://github.com/WordPress/gutenberg/blob/trunk/packages/editor/src/components/autocompleters/user.js
  options: [
    {
      [OPTION_KEY]: 'test1',
      [OPTION_LABEL]: 'Patient name',
      [OPTION_IS_SHARED]: false,
      [OPTION_TYPE]: Constants.BLOCK_DATA_ELEMENT_TEXT,
    },
    {
      [OPTION_KEY]: 'test2',
      [OPTION_LABEL]: 'Pronoun',
      [OPTION_IS_SHARED]: true,
      [OPTION_TYPE]: Constants.BLOCK_DATA_ELEMENT_OPTIONS,
      [OPTION_OPTIONS_SHAPE_KEY]: 'subject',
      [OPTION_OPTIONS_SHAPE_LABEL]: 'Subject',
    },
    {
      [OPTION_KEY]: 'test2',
      [OPTION_LABEL]: 'Pronoun',
      [OPTION_IS_SHARED]: true,
      [OPTION_TYPE]: Constants.BLOCK_DATA_ELEMENT_OPTIONS,
      [OPTION_OPTIONS_SHAPE_KEY]: 'object',
      [OPTION_OPTIONS_SHAPE_LABEL]: 'Object',
    },
    {
      [OPTION_KEY]: 'test2',
      [OPTION_LABEL]: 'Pronoun',
      [OPTION_IS_SHARED]: true,
      [OPTION_TYPE]: Constants.BLOCK_DATA_ELEMENT_OPTIONS,
      [OPTION_OPTIONS_SHAPE_KEY]: 'possessive',
      [OPTION_OPTIONS_SHAPE_LABEL]: 'Possessive',
    },
  ],
  // Returns a label for an option in the autocompleter popover menu
  // This return value is wrapped in a `button` with the `className` specified above
  getOptionLabel(option) {
    return <DataElementOption.MenuItem {...option} />;
  },
  // Declares that options should be matched by their label
  getOptionKeywords(option) {
    return filter([
      option[OPTION_LABEL],
      option[OPTION_OPTIONS_SHAPE_LABEL],
      option[OPTION_IS_SHARED] && LABEL_SHARED,
    ]);
  },
  // Inserting completion into text should replace trigger text with the specified `value`
  getOptionCompletion(option, filteredVal) {
    return <DataElementOption {...option} />;
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
