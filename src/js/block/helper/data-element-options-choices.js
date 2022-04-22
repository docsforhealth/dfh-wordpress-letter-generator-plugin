import { useBlockProps } from '@wordpress/block-editor';
import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import * as Constants from 'src/js/constants';
import AutoLabelAppender from 'src/js/component/auto-label-appender';

// TODO

registerBlockType(Constants.BLOCK_DATA_ELEMENT_OPTIONS_CHOICES, {
  apiVersion: 2,
  title: __('Choices for Options Data Element', Constants.TEXT_DOMAIN),
  category: Constants.CATEGORY_LETTER_TEMPLATE,
  icon: 'list-view',
  description: __(
    'Specify the various choices available for selection for this options-based data element',
    Constants.TEXT_DOMAIN,
  ),
  // supports: { inserter: false }, // TODO
  edit({ attributes, setAttributes }) {
    // TODO label
    return (
      <div {...useBlockProps()}>
        <InnerBlocks
          allowedBlocks={[Constants.BLOCK_DATA_ELEMENT_OPTIONS_OPTION]}
          renderAppender={() => (
            <AutoLabelAppender
              deemphasized={true}
              label={__('Add option choice', Constants.TEXT_DOMAIN)}
            />
          )}
        />
      </div>
    );
  },
});
