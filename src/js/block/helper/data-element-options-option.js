import { useBlockProps } from '@wordpress/block-editor';
import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import * as Constants from 'src/js/constants';

// TODO

export const CONTEXT_SHAPE_KEY = `${Constants.BLOCK_DATA_ELEMENT_OPTIONS_OPTION}/shape`;
export const CONTEXT_SHAPE_DEFINITION = { type: 'object' };

registerBlockType(Constants.BLOCK_DATA_ELEMENT_OPTIONS_OPTION, {
  apiVersion: 2,
  title: __('Option for Options Data Element', Constants.TEXT_DOMAIN),
  category: Constants.CATEGORY_LETTER_TEMPLATE,
  icon: 'list-view',
  description: __(
    'A specific option available for selection within an options-based data element',
    Constants.TEXT_DOMAIN,
  ),
  // supports: { inserter: false }, // TODO
  attributes: {
    label: { type: 'string' },
    value: { type: 'object' },
  },
  usesContext: [CONTEXT_SHAPE_KEY],
  edit({ attributes, setAttributes }) {
    return <div {...useBlockProps()}></div>;
  },
});
