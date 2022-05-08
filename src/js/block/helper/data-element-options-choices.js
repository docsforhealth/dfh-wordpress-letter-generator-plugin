import { InnerBlocks, useBlockProps } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import { CONTEXT_SHAPE_KEY } from 'src/js/block/helper/data-element-options-option';
import CustomBlockStatusInfo from 'src/js/component/custom-block-status-info';
import EditorLabelWrapper from 'src/js/component/editor-label-wrapper';
import SingleBlockAppender from 'src/js/component/single-block-appender';
import * as Constants from 'src/js/constants';
import { tryRegisterBlockType } from 'src/js/utils/block';

tryRegisterBlockType(Constants.BLOCK_DATA_ELEMENT_OPTIONS_CHOICES, {
  apiVersion: 2,
  title: __('Choices for Options Data Element', Constants.TEXT_DOMAIN),
  category: Constants.CATEGORY_LETTER_TEMPLATE,
  icon: 'feedback',
  description: __(
    'Specify the various choices available for selection for this options-based data element',
    Constants.TEXT_DOMAIN,
  ),
  supports: { inserter: false },
  usesContext: [CONTEXT_SHAPE_KEY],
  edit({ clientId, context, attributes, setAttributes }) {
    return (
      <div {...useBlockProps()}>
        {context[CONTEXT_SHAPE_KEY]?.length ? (
          <EditorLabelWrapper
            label={__('Option choices', Constants.TEXT_DOMAIN)}
          >
            {(id) => (
              <div id={id} tabIndex="0">
                <InnerBlocks
                  templateLock={Constants.INNER_BLOCKS_UNLOCKED}
                  allowedBlocks={[Constants.BLOCK_DATA_ELEMENT_OPTIONS_OPTION]}
                  renderAppender={() => (
                    <SingleBlockAppender
                      label={__('Add choice', Constants.TEXT_DOMAIN)}
                      blockName={Constants.BLOCK_DATA_ELEMENT_OPTIONS_OPTION}
                      clientId={clientId}
                      deemphasized
                    />
                  )}
                />
              </div>
            )}
          </EditorLabelWrapper>
        ) : (
          <CustomBlockStatusInfo
            errors={[
              __(
                'Please specify data that each option contains first',
                Constants.TEXT_DOMAIN,
              ),
            ]}
          />
        )}
      </div>
    );
  },
  save() {
    return (
      <div {...useBlockProps.save()}>
        <InnerBlocks.Content />
      </div>
    );
  },
});
