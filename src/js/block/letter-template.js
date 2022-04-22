import { useBlockProps } from '@wordpress/block-editor';
import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import * as Constants from 'src/js/constants';

// TODO

registerBlockType(`${Constants.NAMESPACE}/letter-template`, {
  apiVersion: 2,
  title: __('Letter Template', Constants.TEXT_DOMAIN),
  category: Constants.CATEGORY_LETTER_TEMPLATE,
  icon: 'welcome-write-blog',
  description: __(
    'Specify data elements and letter content for a letter template',
    Constants.TEXT_DOMAIN,
  ),
  // supports: { inserter: false }, // TODO
  edit({ attributes, setAttributes }) {
    return <div {...useBlockProps()}></div>;
  },
});
