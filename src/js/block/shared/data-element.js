import {
  TextareaControl,
  TextControl,
  ToggleControl,
} from '@wordpress/components';
import { useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { every } from 'lodash';
import PropTypes from 'prop-types';
import * as Constants from 'src/js/constants';
import { markAttrHiddenInApi } from 'src/js/utils/api';
import { getTitleFromBlockName } from 'src/js/utils/block';

// TODO inline error styling for controls that are required but empty!!!

// TODO add: this element is used in ## places?
// TODO some kind of portal system for nested inner blocks to add to?
//      https://github.com/WordPress/gutenberg/tree/trunk/packages/element#createportal

// TODO editor display styling!!!
// TODO array order in visible controls determines layout order??
// TODO implementing classes can control order?

export const ATTR_VISIBLE_CONTROLS = markAttrHiddenInApi('controlsToShow');
export const ATTR_KEY = 'dataKey';
export const ATTR_LABEL = 'label';
export const ATTR_HELP_TEXT = 'helpText';
export const ATTR_SAVEABLE = 'saveable';
export const ATTR_REQUIRED = 'required';

// Can specify visible controls via Context if needed instead of via directly-passed attribute
export const CONTEXT_VISIBLE_CONTROLS_KEY = `${Constants.NAMESPACE}/data-element/${ATTR_VISIBLE_CONTROLS}`;
export const CONTEXT_VISIBLE_CONTROLS_DEFINITION = { type: 'array' };

export const SHARED_CONFIG = {
  category: Constants.CATEGORY_LETTER_TEMPLATE,
  // parent: [Constants.BLOCK_DATA_ELEMENTS], // TODO
  attributes: {
    // If defined, only controls corresponding to attribute keys contained in this array will be
    // shown in the editor. If not defined, then all attribute controls will be shown.
    [ATTR_VISIBLE_CONTROLS]: CONTEXT_VISIBLE_CONTROLS_DEFINITION,
    [ATTR_KEY]: { type: 'string' },
    // TIP set default values for user-editable properties so they always are controlled
    // instead of converting from uncontrolled to controlled when first filled in
    [ATTR_LABEL]: { type: 'string', default: '' },
    [ATTR_HELP_TEXT]: { type: 'string', default: '' },
    [ATTR_REQUIRED]: { type: 'boolean', default: true },
    [ATTR_SAVEABLE]: { type: 'boolean', default: false },
  },
  usesContext: [CONTEXT_VISIBLE_CONTROLS_KEY],
};

export function Edit({
  clientId,
  context,
  attributes,
  setAttributes,
  className,
  children,
  ...otherProps
}) {
  // if key is null on initial insertion, set unique key programmatically
  useEffect(() => {
    if (!attributes[ATTR_KEY]) {
      setAttributes({ [ATTR_KEY]: clientId });
    }
  }, []);
  return (
    <div {...otherProps} className={`data-element ${className ?? ''}`}>
      {shouldShowControl({ context, attributes }, ATTR_LABEL) && (
        <TextControl
          label={__('Label', Constants.TEXT_DOMAIN)}
          value={attributes[ATTR_LABEL]}
          onChange={(label) => setAttributes({ [ATTR_LABEL]: label })}
        />
      )}
      {shouldShowControl({ context, attributes }, ATTR_HELP_TEXT) && (
        <TextareaControl
          label={__('Help text', Constants.TEXT_DOMAIN)}
          help={__(
            'Optional, provide any tips for filling out this data element',
            Constants.TEXT_DOMAIN,
          )}
          value={attributes[ATTR_HELP_TEXT]}
          onChange={(helpText) => setAttributes({ [ATTR_HELP_TEXT]: helpText })}
        />
      )}
      {shouldShowControl({ context, attributes }, ATTR_REQUIRED) && (
        <ToggleControl
          label={__('Is this field mandatory?', Constants.TEXT_DOMAIN)}
          checked={attributes[ATTR_REQUIRED]}
          onChange={(required) => setAttributes({ [ATTR_REQUIRED]: required })}
        />
      )}
      {shouldShowControl({ context, attributes }, ATTR_SAVEABLE) && (
        <ToggleControl
          label={__('Allow saving locally?', Constants.TEXT_DOMAIN)}
          help={__(
            "Saving locally to the user's device is NOT secure. Make sure that this field will not have protected health information.",
            Constants.TEXT_DOMAIN,
          )}
          checked={attributes[ATTR_SAVEABLE]}
          onChange={(saveable) => setAttributes({ [ATTR_SAVEABLE]: saveable })}
        />
      )}
      {children}
    </div>
  );
}
Edit.propTypes = {
  clientId: PropTypes.string.isRequired,
  context: PropTypes.object.isRequired,
  attributes: PropTypes.object.isRequired,
  setAttributes: PropTypes.func.isRequired,
  className: PropTypes.string,
};

// Allows programmatically controlling which controls are displayed in the editor
export function shouldShowControl({ attributes, context }, ...attrsToCheck) {
  // visible controls specified via attributes overrides those provided by context
  const visibleControls =
    attributes?.[ATTR_VISIBLE_CONTROLS] ??
    context?.[CONTEXT_VISIBLE_CONTROLS_KEY];
  return (
    !visibleControls ||
    every(attrsToCheck, (attr) => visibleControls.includes(attr))
  );
}

// Given the block type obtained from the `core/block-editor` store, determines if this block is valid
// This is the default implementation that blocks can leverage if desired.
export function validateBlockInfo(blockInfo) {
  const blockTitle = getTitleFromBlockName(blockInfo?.name);
  const errors = [];
  if (!blockInfo?.attributes?.[ATTR_LABEL]) {
    errors.push(
      __('Please specify a label for', Constants.TEXT_DOMAIN) +
        ' ' +
        blockTitle,
    );
  }
  if (!blockInfo?.attributes?.[ATTR_KEY]) {
    errors.push(
      __('Missing a unique key for', Constants.TEXT_DOMAIN) + ' ' + blockTitle,
    );
  }
  return errors;
}
