import { InnerBlocks, useBlockProps } from '@wordpress/block-editor';
import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import AutoLabelAppender from 'src/js/component/auto-label-appender';
import EditorLabelWrapper from 'src/js/component/editor-label-wrapper';
import * as Constants from 'src/js/constants';

registerBlockType(Constants.BLOCK_DATA_ELEMENT_OPTIONS_CHOICES, {
  apiVersion: 2,
  title: __('Choices for Options Data Element', Constants.TEXT_DOMAIN),
  category: Constants.CATEGORY_LETTER_TEMPLATE,
  icon: 'feedback',
  description: __(
    'Specify the various choices available for selection for this options-based data element',
    Constants.TEXT_DOMAIN,
  ),
  supports: { inserter: false },
  edit({ attributes, setAttributes }) {
    return (
      <div {...useBlockProps()}>
        <EditorLabelWrapper label={__('Option choices', Constants.TEXT_DOMAIN)}>
          <div tabIndex="-1">
            <InnerBlocks
              templateLock={Constants.INNER_BLOCKS_UNLOCKED}
              allowedBlocks={[Constants.BLOCK_DATA_ELEMENT_OPTIONS_OPTION]}
              renderAppender={() => (
                <AutoLabelAppender
                  deemphasized={true}
                  label={__('Add option choice', Constants.TEXT_DOMAIN)}
                />
              )}
            />
          </div>
        </EditorLabelWrapper>
      </div>
    );
  },
  save() {
    return <InnerBlocks.Content />;
  },
});
