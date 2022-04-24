import { InnerBlocks, useBlockProps } from '@wordpress/block-editor';
import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import { filter } from 'lodash';
import AutoLabelAppender from 'src/js/component/auto-label-appender';
import EditorLabelWrapper from 'src/js/component/editor-label-wrapper';
import * as Constants from 'src/js/constants';

// TODO consider custom appender showing all data element types available to add all laid out

registerBlockType(Constants.BLOCK_DATA_ELEMENTS, {
  apiVersion: 2,
  title: __('Data Elements', Constants.TEXT_DOMAIN),
  category: Constants.CATEGORY_LETTER_TEMPLATE,
  icon: 'forms',
  description: __(
    'Specify definitions for data elements',
    Constants.TEXT_DOMAIN,
  ),
  attributes: {
    label: {
      type: 'string',
      default: __('Data elements', Constants.TEXT_DOMAIN),
    },
    appenderLabel: { type: 'string', default: '' },
    deemphasizeAppender: { type: 'boolean', default: false },
    isLocked: { type: 'boolean', default: false },
    allowImages: { type: 'boolean', default: true },
    allowOptions: { type: 'boolean', default: true },
    allowText: { type: 'boolean', default: true },
  },
  edit({ attributes, setAttributes }) {
    return (
      <div {...useBlockProps()}>
        <EditorLabelWrapper label={attributes.label}>
          <div tabIndex="-1">
            <InnerBlocks
              templateLock={
                attributes.isLocked
                  ? Constants.INNER_BLOCKS_LOCKED
                  : Constants.INNER_BLOCKS_UNLOCKED
              }
              allowedBlocks={filter([
                attributes.allowImages && Constants.BLOCK_DATA_ELEMENT_IMAGE,
                attributes.allowOptions && Constants.BLOCK_DATA_ELEMENT_OPTIONS,
                attributes.allowText && Constants.BLOCK_DATA_ELEMENT_TEXT,
              ])}
              renderAppender={() => (
                <AutoLabelAppender
                  deemphasized={attributes.deemphasizeAppender}
                  label={attributes.appenderLabel}
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
