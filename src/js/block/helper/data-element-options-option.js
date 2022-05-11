import { useBlockProps } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import {
  ATTR_PLACEHOLDER,
  ATTR_TYPE,
} from 'src/js/block/helper/data-element-text';
import {
  ATTR_HELP_TEXT,
  ATTR_KEY,
  ATTR_LABEL,
} from 'src/js/block/shared/data-element';
import DataElementOption from 'src/js/component/data-element-option';
import * as Constants from 'src/js/constants';
import { tryRegisterBlockType } from 'src/js/utils/block';

// IMPORTANT: shape is the an array of the ATTRIBUTES of the TEXT DATA ELEMENTS
export const CONTEXT_SHAPE_KEY = `${Constants.BLOCK_DATA_ELEMENT_OPTIONS_OPTION}/shape`;
export const CONTEXT_SHAPE_DEFINITION = { type: 'array' };

export const EXPECTED_VISIBLE_ATTRS = [
  ATTR_KEY,
  ATTR_TYPE,
  ATTR_LABEL,
  ATTR_PLACEHOLDER,
  ATTR_HELP_TEXT,
];

tryRegisterBlockType(Constants.BLOCK_DATA_ELEMENT_OPTIONS_OPTION, {
  apiVersion: 2,
  title: __('Option for Options Data Element', Constants.TEXT_DOMAIN),
  category: Constants.CATEGORY_LETTER_TEMPLATE,
  icon: 'excerpt-view',
  description: __(
    'A specific option available for selection within an options-based data element',
    Constants.TEXT_DOMAIN,
  ),
  // TIP: use `parent` instead of `inserter: false` because `inserter: false` will remove this element
  // from inserters EVERYWHERE, including for `InnerBlocks`. Instead, using `parent` makes it so
  // so that this element only shows up in the inserter within the specific parent element
  parent: [Constants.BLOCK_DATA_ELEMENT_OPTIONS_CHOICES],
  attributes: {
    label: { type: 'string', default: '' },
    value: { type: 'object' },
  },
  usesContext: [CONTEXT_SHAPE_KEY],
  edit({ attributes, context, setAttributes }) {
    return (
      <div {...useBlockProps()}>
        <DataElementOption
          label={attributes.label}
          thisValue={attributes.value}
          shapeValues={context[CONTEXT_SHAPE_KEY]}
          updateLabel={(label) => setAttributes({ label })}
          updateThisValue={(dataKey, newValue) =>
            setAttributes({
              value: { ...attributes.value, [dataKey]: newValue },
            })
          }
        />
      </div>
    );
  },
});
