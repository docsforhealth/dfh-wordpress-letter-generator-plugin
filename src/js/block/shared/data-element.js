import { forwardRef, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';
import DataElement from 'src/js/component/data-element';
import * as Constants from 'src/js/constants';
import { markAttrHiddenInApi } from 'src/js/utils/api';
import { getTitleFromBlockName } from 'src/js/utils/block';
import {
  reconcileVisibleAttrsAndContext,
  shouldShowControl,
} from 'src/js/utils/data-element';

// TODO inline error styling for controls that are required but empty!!!

// **************
// * Attributes *
// **************

export const ATTR_VISIBLE_CONTROLS = markAttrHiddenInApi('controlsToShow');
export const ATTR_KEY = 'dataKey';
export const ATTR_LABEL = 'label';
export const ATTR_HELP_TEXT = 'helpText';
export const ATTR_SAVEABLE = 'saveable';
export const ATTR_REQUIRED = 'required';

// Can specify visible controls via Context if needed instead of via directly-passed attribute
export const CONTEXT_VISIBLE_CONTROLS_KEY = `${Constants.NAMESPACE}/data-element/${ATTR_VISIBLE_CONTROLS}`;
export const CONTEXT_VISIBLE_CONTROLS_DEFINITION = { type: 'array' };

// **************
// * Validation *
// **************

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

// **********
// * Config *
// **********

export const SHARED_CONFIG = {
  category: Constants.CATEGORY_LETTER_TEMPLATE,
  parent: [Constants.BLOCK_DATA_ELEMENTS],
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

// ********
// * Edit *
// ********

export const Edit = forwardRef(
  (
    { clientId, context, attributes, setAttributes, children, ...otherProps },
    ref,
  ) => {
    // if key is null on initial insertion, set unique key programmatically ONCE
    useEffect(() => {
      if (!attributes[ATTR_KEY]) {
        setAttributes({ [ATTR_KEY]: clientId });
      }
    }, []);
    const visibleControls = reconcileVisibleAttrsAndContext(
      attributes[ATTR_VISIBLE_CONTROLS],
      context[CONTEXT_VISIBLE_CONTROLS_KEY],
    );
    return (
      <DataElement
        ref={ref}
        blockProps={otherProps}
        className={`${otherProps.className} ${
          attributes[ATTR_REQUIRED] ? 'data-element--required' : ''
        }`}
        clientId={clientId}
        label={{
          value: attributes[ATTR_LABEL],
          shouldShow: shouldShowControl(visibleControls, ATTR_LABEL),
          onChange: (label) => setAttributes({ [ATTR_LABEL]: label }),
        }}
        required={{
          value: attributes[ATTR_REQUIRED],
          shouldShow: shouldShowControl(visibleControls, ATTR_REQUIRED),
          onChange: (required) => setAttributes({ [ATTR_REQUIRED]: required }),
        }}
        saveable={{
          value: attributes[ATTR_SAVEABLE],
          shouldShow: shouldShowControl(visibleControls, ATTR_SAVEABLE),
          onChange: (saveable) => setAttributes({ [ATTR_SAVEABLE]: saveable }),
        }}
        helpText={{
          value: attributes[ATTR_HELP_TEXT],
          shouldShow: shouldShowControl(visibleControls, ATTR_HELP_TEXT),
          onChange: (helpText) => setAttributes({ [ATTR_HELP_TEXT]: helpText }),
        }}
      >
        {children}
      </DataElement>
    );
  },
);
Edit.propTypes = {
  clientId: PropTypes.string.isRequired,
  context: PropTypes.object.isRequired,
  attributes: PropTypes.object.isRequired,
  setAttributes: PropTypes.func.isRequired,
};

// ********
// * Save *
// ********

export const Save = forwardRef(
  ({ attributes, children, ...otherProps }, ref) => {
    return (
      <div ref={ref} {...otherProps}>
        <DataElement.Content helpText={attributes[ATTR_HELP_TEXT]}>
          {children}
        </DataElement.Content>
      </div>
    );
  },
);
Save.propTypes = {
  attributes: PropTypes.object.isRequired,
};
