import { __ } from '@wordpress/i18n';
import { Icon } from '@wordpress/icons';
import { endsWith, startsWith } from 'lodash';
import PropTypes from 'prop-types';
import { ICON as IMAGE_ICON } from 'src/js/block/helper/data-element-image';
import { ICON as OPTIONS_ICON } from 'src/js/block/helper/data-element-options';
import { ICON as TEXT_ICON } from 'src/js/block/helper/data-element-text';
import * as Constants from 'src/js/constants';
import { buildSVGDataURI } from 'src/js/utils';

const OPTION_TEXT_SPACER = ' ';

export const LABEL_SHARED = __('Shared', Constants.TEXT_DOMAIN);

export const OPTION_KEY = 'dataKey';
export const OPTION_LABEL = 'label';
export const OPTION_IS_SHARED = 'isShared';
export const OPTION_TYPE = 'type';
// Only if `OPTION_TYPE` is `BLOCK_DATA_ELEMENT_OPTIONS`
export const OPTION_OPTIONS_SHAPE_KEY = 'optionsShapeKey';
export const OPTION_OPTIONS_SHAPE_LABEL = 'optionsShapeLabel';

export const ELEMENT_TAG_NAME = 'span';
export const ELEMENT_CLASS_NAME = 'data-element-option';

export const ELEMENT_ATTR_KEY = 'data-letter-element-key';
export const ELEMENT_ATTR_OPTIONS_SHAPE_KEY =
  'data-letter-element-options-shape-key';
export const ELEMENT_ATTR_TYPE = 'data-letter-element-type';
export const ELEMENT_ATTR_IS_SHARED = 'data-letter-element-is-shared';
export const ELEMENT_ATTR_ORIGINAL_LABEL = 'data-letter-element-original-label';

export default function DataElementOption(props) {
  const { className } = props,
    label = ensureSpaceAround(
      buildOptionText(props[OPTION_LABEL], props[OPTION_OPTIONS_SHAPE_LABEL]),
    ),
    // We use the WordPress `Icon` component to ensure a standard 24px by 24px size
    // see https://github.com/WordPress/gutenberg/blob/trunk/packages/icons/src/icon/index.js
    iconDataURI = buildSVGDataURI(
      <Icon icon={getIconFromType(props[OPTION_TYPE])} />,
    ),
    elementAttrs = {
      [ELEMENT_ATTR_KEY]: props[OPTION_KEY],
      [ELEMENT_ATTR_OPTIONS_SHAPE_KEY]: props[OPTION_OPTIONS_SHAPE_KEY],
      [ELEMENT_ATTR_TYPE]: props[OPTION_TYPE],
      [ELEMENT_ATTR_IS_SHARED]: props[OPTION_IS_SHARED],
      [ELEMENT_ATTR_ORIGINAL_LABEL]: label,
    };
  // 1. We can't attach event handlers to the returned element because the WP source code uses
  // `renderToString` which will strip out all bound handlers. Therefore, we have to combine this
  // with imperative event handling within the `data-element` custom format
  // WP source: https://github.com/WordPress/gutenberg/blob/trunk/packages/components/src/autocomplete/index.js#L141
  // explanation for `renderToString` server side rendering: https://stackoverflow.com/a/36234805
  // 2. We shouldn't add nested elements within the returned element because these
  // are interpreted by `rich-text` be SEPARATE formats which makes adding/removing these elements
  // to be messier. Therefore, avoid adding nested elements
  return (
    <ELEMENT_TAG_NAME
      {...elementAttrs}
      className={`${ELEMENT_CLASS_NAME} ${className ?? ''}`}
      // See `_data-element-option.scss` file for adding to badges via `background-image`
      // 1. We use `background-image` instead of an SVG icon to avoid adding a potentially editable
      // value that needs to be accounted for when ensuring the original text label
      // 2. We need to add a separate `data-letter-element-has-icon` AND a CSS variable because
      // CSS selectors can only use attributes and CSS non-string properties can only use CSS variables
      data-letter-element-has-icon={!!iconDataURI}
      style={`--dfh-data-element-option-icon: ${iconDataURI}`}
    >
      {label}
    </ELEMENT_TAG_NAME>
  );
}
DataElementOption.propTypes = {
  [OPTION_KEY]: PropTypes.string.isRequired,
  [OPTION_LABEL]: PropTypes.string.isRequired,
  [OPTION_IS_SHARED]: PropTypes.bool.isRequired,
  [OPTION_TYPE]: PropTypes.string.isRequired,
  [OPTION_OPTIONS_SHAPE_KEY]: PropTypes.string,
  [OPTION_OPTIONS_SHAPE_LABEL]: PropTypes.string,
  className: PropTypes.string,
};

// WP autocomplete will wrap the return value from `getOptionLabel` in a `button`
DataElementOption.MenuItem = function (props) {
  const icon = getIconFromType(props[OPTION_TYPE]);
  return (
    <>
      {icon && (
        <Icon icon={icon} className="data-element-option-menu-item__icon" />
      )}
      <span className="data-element-option-menu-item__label">
        {ensureSpaceAround(
          buildOptionText(
            props[OPTION_LABEL],
            props[OPTION_OPTIONS_SHAPE_LABEL],
          ),
        )}
      </span>
      {props[OPTION_IS_SHARED] && (
        <span className="data-element-option-menu-item__badge">
          {LABEL_SHARED}
        </span>
      )}
    </>
  );
};
DataElementOption.MenuItem.propTypes = {
  [OPTION_LABEL]: PropTypes.string.isRequired,
  [OPTION_IS_SHARED]: PropTypes.bool.isRequired,
  [OPTION_TYPE]: PropTypes.string.isRequired,
  [OPTION_OPTIONS_SHAPE_LABEL]: PropTypes.string,
};

function getIconFromType(type) {
  switch (type) {
    case Constants.BLOCK_DATA_ELEMENT_TEXT:
      return TEXT_ICON;
    case Constants.BLOCK_DATA_ELEMENT_IMAGE:
      return IMAGE_ICON;
    case Constants.BLOCK_DATA_ELEMENT_OPTIONS:
      return OPTIONS_ICON;
    default:
      return null;
  }
}

// Do NOT using padding around badge to prevent unintuitive cursor behavior. Therefore, need to ensure
// that the option text both starts and ends with a space for adequate spacing
function ensureSpaceAround(optionText) {
  let newOptionText = optionText;
  if (!startsWith(optionText, OPTION_TEXT_SPACER)) {
    newOptionText = OPTION_TEXT_SPACER + newOptionText;
  }
  if (!endsWith(optionText, OPTION_TEXT_SPACER)) {
    newOptionText = newOptionText + OPTION_TEXT_SPACER;
  }
  return newOptionText;
}

// We don't include the trigger prefix in the option text so the autocomplete menu won't trigger
// even if the text matches
function buildOptionText(label, shapeLabel = null) {
  return shapeLabel ? `${label} (${shapeLabel})` : label;
}
