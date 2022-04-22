import { InnerBlocks, useBlockProps } from '@wordpress/block-editor';
import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import AutoLabelAppender from 'src/js/component/auto-label-appender';
import * as Constants from 'src/js/constants';

// TODO

registerBlockType(Constants.BLOCK_DATA_ELEMENT_OPTIONS_SHAPE, {
  apiVersion: 2,
  title: __('Shape for Options Data Element', Constants.TEXT_DOMAIN),
  category: Constants.CATEGORY_LETTER_TEMPLATE,
  icon: 'list-view',
  description: __(
    'Customize the shape of the value for each choice for this options-based data element',
    Constants.TEXT_DOMAIN,
  ),
  // supports: { inserter: false }, // TODO
  edit({ attributes, setAttributes }) {
    // TODO label
    return (
      <div {...useBlockProps()}>
        <InnerBlocks
          allowedBlocks={[Constants.BLOCK_DATA_ELEMENT_TEXT]}
          renderAppender={() => (
            <AutoLabelAppender
              deemphasized={true}
              label={__('Add attribute to value', Constants.TEXT_DOMAIN)}
            />
          )}
        />
      </div>
    );
  },
});
