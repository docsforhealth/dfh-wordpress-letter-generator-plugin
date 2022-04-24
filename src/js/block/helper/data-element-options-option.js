import { useBlockProps } from '@wordpress/block-editor';
import { registerBlockType } from '@wordpress/blocks';
import { TextControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import * as TextDataElement from 'src/js/block/helper/data-element-text';
import * as DataElement from 'src/js/block/shared/data-element';
import OptionChoiceValue from 'src/js/component/option-choice-value';
import * as Constants from 'src/js/constants';

// Expected: shape is the an array of the attributes of the TEXT DATA ELEMENTS
export const CONTEXT_SHAPE_KEY = `${Constants.BLOCK_DATA_ELEMENT_OPTIONS_OPTION}/shape`;
export const CONTEXT_SHAPE_DEFINITION = { type: 'array' };
export const EXPECTED_VISIBLE_ATTRS = [
  DataElement.ATTR_KEY,
  TextDataElement.ATTR_TYPE,
  DataElement.ATTR_LABEL,
  TextDataElement.ATTR_PLACEHOLDER,
  DataElement.ATTR_HELP_TEXT,
];

registerBlockType(Constants.BLOCK_DATA_ELEMENT_OPTIONS_OPTION, {
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
        <TextControl
          label={__('Option Label', Constants.TEXT_DOMAIN)}
          value={attributes.label}
          onChange={(label) => setAttributes({ label })}
        />
        {context[CONTEXT_SHAPE_KEY]?.map((singleValueAttrs) => {
          const dataKey = singleValueAttrs[DataElement.ATTR_KEY];
          return (
            <OptionChoiceValue
              {...singleValueAttrs}
              key={dataKey}
              // Set default as empty string to prevent uncontrolled-->controlled errors
              value={attributes.value?.[dataKey] ?? ''}
              onChange={(dataKey, newValue) =>
                setAttributes({
                  value: { ...attributes.value, [dataKey]: newValue },
                })
              }
            />
          );
        })}
      </div>
    );
  },
});
