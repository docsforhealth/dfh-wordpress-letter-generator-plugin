import { useBlockProps } from '@wordpress/block-editor';
import { useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { map, pick } from 'lodash';
import DataElementOption from 'src/js/component/data-element-option';
import * as Constants from 'src/js/constants';
import {
  ATTR_KEY,
  ATTR_LABEL,
  ATTR_PLACEHOLDER,
  ATTR_TEXT_TYPE,
} from 'src/js/constants/data-element';
import { tryRegisterBlockType } from 'src/js/utils/block';

// IMPORTANT: shape is the an array of the ATTRIBUTES of the TEXT DATA ELEMENTS
export const CONTEXT_SHAPE_KEY = `${Constants.BLOCK_DATA_ELEMENT_OPTIONS_OPTION}/shape`;
export const CONTEXT_SHAPE_DEFINITION = { type: 'array' };

export const EXPECTED_VISIBLE_ATTRS = [
  ATTR_KEY,
  ATTR_TEXT_TYPE,
  ATTR_LABEL,
  ATTR_PLACEHOLDER,
];

// NOTE: no ID so should not be treated as an independent entity in the API

tryRegisterBlockType(Constants.BLOCK_DATA_ELEMENT_OPTIONS_OPTION, {
  apiVersion: 2,
  title: __('Options Data Element Single Choice', Constants.TEXT_DOMAIN),
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
    const currentShapeDataKeys = useMemo(
      () => map(context[CONTEXT_SHAPE_KEY], ATTR_KEY),
      [context[CONTEXT_SHAPE_KEY]],
    );
    return (
      <DataElementOption
        {...useBlockProps()}
        label={attributes.label}
        thisValue={attributes.value}
        shapeValues={context[CONTEXT_SHAPE_KEY]}
        updateLabel={(label) => setAttributes({ label })}
        updateThisValue={(dataKey, newValue) =>
          setAttributes({
            value: {
              ...pick(attributes.value, currentShapeDataKeys),
              [dataKey]: newValue,
            },
          })
        }
      />
    );
  },
});
