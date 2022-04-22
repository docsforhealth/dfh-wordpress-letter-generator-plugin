import { useBlockProps } from '@wordpress/block-editor';
import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import * as Constants from 'src/js/constants';

// TODO

registerBlockType(`${Constants.NAMESPACE}/letter-content`, {
  apiVersion: 2,
  title: __('Letter Content', Constants.TEXT_DOMAIN),
  category: Constants.CATEGORY_LETTER_TEMPLATE,
  icon: 'text-page',
  description: __(
    'Specify letter content with embedded data elements for a letter template',
    Constants.TEXT_DOMAIN,
  ),
  // supports: { inserter: false }, // TODO
  edit({ attributes, setAttributes }) {
    return <div {...useBlockProps()}></div>;
  },
});
