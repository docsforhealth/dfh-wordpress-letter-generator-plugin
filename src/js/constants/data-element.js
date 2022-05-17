import { __ } from '@wordpress/i18n';
import { image, list, paragraph, symbolFilled } from '@wordpress/icons';
import * as Constants from 'src/js/constants';
import { markAttrHiddenInApi } from 'src/js/utils/api';

// *******************
// * Base attributes *
// *******************

export const ATTR_KEY = 'dataKey';
export const ATTR_LABEL = 'label';
export const ATTR_VISIBLE_CONTROLS = markAttrHiddenInApi('controlsToShow');
export const ATTR_HELP_TEXT = 'helpText';
export const ATTR_SAVEABLE = 'saveable';
export const ATTR_REQUIRED = 'required';

// *********************
// * Block information *
// *********************

export const IMAGE_INFO = {
  name: Constants.BLOCK_DATA_ELEMENT_IMAGE,
  icon: image,
  title: __('Image Element', Constants.TEXT_DOMAIN),
  description: __(
    'Allows uploading images and user drawings',
    Constants.TEXT_DOMAIN,
  ),
};
export const OPTIONS_INFO = {
  name: Constants.BLOCK_DATA_ELEMENT_OPTIONS,
  icon: list,
  title: __('Options Element', Constants.TEXT_DOMAIN),
  description: __(
    'Allow selection of predefined options or user-specified option',
    Constants.TEXT_DOMAIN,
  ),
};
export const TEXT_INFO = {
  name: Constants.BLOCK_DATA_ELEMENT_TEXT,
  icon: paragraph,
  title: __('Text Element', Constants.TEXT_DOMAIN),
  description: __('Allows entry of text-based values', Constants.TEXT_DOMAIN),
};
export const LETTER_DATA_ELEMENTS_ICON = symbolFilled;

// *******************
// * Text attributes *
// *******************

export const ATTR_TYPE = 'textType';
export const ATTR_PLACEHOLDER = 'placeholder';
export const ATTR_CONTEXT_BEFORE = 'showContextBefore';
export const ATTR_NOOP_SHOW_EXAMPLES = markAttrHiddenInApi('noopShowExamples');

// **********************
// * Options attributes *
// **********************

export const ATTR_OTHER_OPTION = 'hasOtherOption';
export const ATTR_NOOP_SHOW_OPTIONS = markAttrHiddenInApi('noopShowOptions');
export const ATTR_SHAPE_VALUE = markAttrHiddenInApi('shapeOfValue'); // TODO do we need to `markAttrHiddenInApi`??

// **********************************
// * Autocomplete option attributes *
// **********************************

export const LABEL_SHARED_OPTION = __('Shared', Constants.TEXT_DOMAIN);
export const OPTION_TEXT_SPACER = ' ';

// The option key is the same as the data key except for option choices which
// include both the data element key AND the shape value attribute key
export const OPTION_COMBO_KEY = 'optionKey';
// Data key is the key attribute of the data element
export const OPTION_DATA_KEY = 'dataKey';
export const OPTION_DISPLAY_LABEL = 'displayLabel';
export const OPTION_LABEL = 'label';
export const OPTION_IS_SHARED = 'isShared';
export const OPTION_BLOCK_NAME = 'blockName';
// Only if `OPTION_BLOCK_NAME` is `BLOCK_DATA_ELEMENT_OPTIONS`
export const OPTION_OPTIONS_SHAPE_KEY = 'optionsShapeKey';
export const OPTION_OPTIONS_SHAPE_LABEL = 'optionsShapeLabel';

// *************************
// * Custom format element *
// *************************

export const ELEMENT_TAG_NAME = 'span';
export const ELEMENT_CLASS_NAME = 'data-element-completion';

export const ELEMENT_ATTR_COMBO_KEY = 'data-letter-element-combo-key';
export const ELEMENT_ATTR_DATA_KEY = 'data-letter-element-data-key';
export const ELEMENT_ATTR_OPTIONS_SHAPE_KEY =
  'data-letter-element-options-shape-key';
export const ELEMENT_ATTR_OPTIONS_SHAPE_LABEL =
  'data-letter-element-options-shape-label';
export const ELEMENT_ATTR_BLOCK_NAME = 'data-letter-element-block-name';
export const ELEMENT_ATTR_IS_SHARED = 'data-letter-element-is-shared';
export const ELEMENT_ATTR_LABEL = 'data-letter-element-label';
// display label has surrounding whitespace and includes the shape label if present
// used for restoring the custom format display
export const ELEMENT_ATTR_ORIGINAL_DISPLAY_LABEL =
  'data-letter-element-original-display-label';
