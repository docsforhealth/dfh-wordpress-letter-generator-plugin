import { InnerBlocks, useBlockProps } from '@wordpress/block-editor';
import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import _ from 'lodash';
import AutoLabelAppender from 'src/js/component/auto-label-appender';
import * as Constants from 'src/js/constants';

// TODO
// TODO create custom placeholder picker for appender??

registerBlockType(Constants.BLOCK_DATA_ELEMENTS, {
  apiVersion: 2,
  title: __('Data Elements', Constants.TEXT_DOMAIN),
  category: Constants.CATEGORY_LETTER_TEMPLATE,
  icon: 'forms',
  description: __(
    'Specify definitions for data elements of various types',
    Constants.TEXT_DOMAIN,
  ),
  // supports: { inserter: false }, // TODO
  attributes: {
    allowImages: { type: 'boolean', default: true },
    allowOptions: { type: 'boolean', default: true },
    allowText: { type: 'boolean', default: true },
  },
  edit({ attributes, setAttributes }) {
    return (
      <div {...useBlockProps()}>
        <InnerBlocks
          allowedBlocks={_.filter([
            allowImages && Constants.BLOCK_DATA_ELEMENT_IMAGE,
            allowOptions && Constants.BLOCK_DATA_ELEMENT_OPTIONS,
            allowText && Constants.BLOCK_DATA_ELEMENT_TEXT,
          ])}
          renderAppender={() => (
            <AutoLabelAppender
              label={__('Add data element', Constants.TEXT_DOMAIN)}
            />
          )}
        />
      </div>
    );
  },
});
