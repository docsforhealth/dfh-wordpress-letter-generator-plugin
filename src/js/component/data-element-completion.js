import { Icon } from '@wordpress/icons';
import PropTypes from 'prop-types';
import {
  ELEMENT_ATTR_BLOCK_NAME,
  ELEMENT_ATTR_COMBO_KEY,
  ELEMENT_ATTR_DATA_KEY,
  ELEMENT_ATTR_IS_SHARED,
  ELEMENT_ATTR_LABEL,
  ELEMENT_ATTR_OPTIONS_SHAPE_KEY,
  ELEMENT_ATTR_OPTIONS_SHAPE_LABEL,
  ELEMENT_ATTR_ORIGINAL_DISPLAY_LABEL,
  ELEMENT_CLASS_NAME,
  ELEMENT_TAG_NAME,
  LABEL_SHARED_OPTION,
  OPTION_BLOCK_NAME,
  OPTION_COMBO_KEY,
  OPTION_DATA_KEY,
  OPTION_DISPLAY_LABEL,
  OPTION_IS_SHARED,
  OPTION_LABEL,
  OPTION_OPTIONS_SHAPE_KEY,
  OPTION_OPTIONS_SHAPE_LABEL,
} from 'src/js/constants/data-element';
import { getIconFromBlockName } from 'src/js/utils/block';
import { buildSVGDataURI } from 'src/js/utils/component';

export default function DataElementCompletion(props) {
  const { className } = props,
    // We use the WordPress `Icon` component to ensure a standard 24px by 24px size
    // see https://github.com/WordPress/gutenberg/blob/trunk/packages/icons/src/icon/index.js
    icon = getIconFromBlockName(props[OPTION_BLOCK_NAME]),
    iconDataURI = buildSVGDataURI(icon && <Icon icon={icon} />),
    elementAttrs = {
      [ELEMENT_ATTR_COMBO_KEY]: props[OPTION_COMBO_KEY],
      [ELEMENT_ATTR_DATA_KEY]: props[OPTION_DATA_KEY],
      [ELEMENT_ATTR_OPTIONS_SHAPE_KEY]: props[OPTION_OPTIONS_SHAPE_KEY],
      [ELEMENT_ATTR_BLOCK_NAME]: props[OPTION_BLOCK_NAME],
      [ELEMENT_ATTR_IS_SHARED]: props[OPTION_IS_SHARED],
      [ELEMENT_ATTR_LABEL]: props[OPTION_LABEL],
      [ELEMENT_ATTR_OPTIONS_SHAPE_LABEL]: props[OPTION_OPTIONS_SHAPE_LABEL],
      // Display label includes the shape value attribute label with the overall data element label
      [ELEMENT_ATTR_ORIGINAL_DISPLAY_LABEL]: props[OPTION_DISPLAY_LABEL],
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
      // See `_data-element-completion.scss` file for adding to badges via `background-image`
      // 1. We use `background-image` instead of an SVG icon to avoid adding a potentially editable
      // value that needs to be accounted for when ensuring the original text label
      // 2. We need to add a separate `data-letter-element-has-icon` AND a CSS variable because
      // CSS selectors can only use attributes and CSS non-string properties can only use CSS variables
      data-letter-element-has-icon={!!iconDataURI}
      style={`--dfh-data-element-completion-icon: ${iconDataURI}`}
    >
      {props[OPTION_DISPLAY_LABEL]}
    </ELEMENT_TAG_NAME>
  );
}
DataElementCompletion.propTypes = {
  [OPTION_COMBO_KEY]: PropTypes.string.isRequired,
  [OPTION_DATA_KEY]: PropTypes.string.isRequired,
  [OPTION_DISPLAY_LABEL]: PropTypes.string.isRequired,
  [OPTION_LABEL]: PropTypes.string.isRequired,
  [OPTION_IS_SHARED]: PropTypes.bool.isRequired,
  [OPTION_BLOCK_NAME]: PropTypes.string.isRequired,
  [OPTION_OPTIONS_SHAPE_KEY]: PropTypes.string,
  className: PropTypes.string,
};

// WP autocomplete will wrap the value of the `label` property in a `button`
DataElementCompletion.MenuItem = function (props) {
  const icon = getIconFromBlockName(props[OPTION_BLOCK_NAME]);
  return (
    <>
      {icon && (
        <Icon icon={icon} className="data-element-completion-menu-item__icon" />
      )}
      <span className="data-element-completion-menu-item__label">
        {props[OPTION_DISPLAY_LABEL]}
      </span>
      {props[OPTION_IS_SHARED] && (
        <span className="data-element-completion-menu-item__badge">
          {LABEL_SHARED_OPTION}
        </span>
      )}
    </>
  );
};
DataElementCompletion.MenuItem.propTypes = {
  [OPTION_DISPLAY_LABEL]: PropTypes.string.isRequired,
  [OPTION_IS_SHARED]: PropTypes.bool.isRequired,
  [OPTION_BLOCK_NAME]: PropTypes.string.isRequired,
};
