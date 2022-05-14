import { InnerBlocks, useBlockProps } from '@wordpress/block-editor';
import { useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { CONTEXT_SHAPE_KEY } from 'src/js/block/helper/data-element-options-option';
import EditorLabelWrapper, {
  STYLE_FORM_LABEL,
} from 'src/js/component/editor-label-wrapper';
import SingleBlockAppender from 'src/js/component/single-block-appender';
import StatusInfoDisplay from 'src/js/component/status-info-display';
import * as Constants from 'src/js/constants';
import { countInnerBlocks, tryRegisterBlockType } from 'src/js/utils/block';

tryRegisterBlockType(Constants.BLOCK_DATA_ELEMENT_OPTIONS_CHOICES, {
  apiVersion: 2,
  title: __('Options Data Element Choices', Constants.TEXT_DOMAIN),
  category: Constants.CATEGORY_LETTER_TEMPLATE,
  icon: 'feedback',
  description: __(
    'Specify the various choices available for selection for this options-based data element',
    Constants.TEXT_DOMAIN,
  ),
  supports: { inserter: false },
  usesContext: [CONTEXT_SHAPE_KEY],
  edit({ clientId, context, attributes, setAttributes }) {
    const numChoices = useSelect((select) =>
      countInnerBlocks(clientId, select),
    );
    return (
      <div {...useBlockProps({ className: 'data-element-options-choices' })}>
        {context[CONTEXT_SHAPE_KEY]?.length ? (
          <EditorLabelWrapper
            label={__('Choices', Constants.TEXT_DOMAIN)}
            style={STYLE_FORM_LABEL}
            controlsClassName="data-element-options-choices__label-container"
            contentClassName="data-element-options-choices__content-container"
            contentSpacing={false}
          >
            {(id) => (
              <div id={id} tabIndex="0">
                <InnerBlocks
                  templateLock={Constants.INNER_BLOCKS_UNLOCKED}
                  allowedBlocks={[Constants.BLOCK_DATA_ELEMENT_OPTIONS_OPTION]}
                  renderAppender={() => (
                    <SingleBlockAppender
                      className="data-element-options-choices__appender"
                      label={
                        numChoices
                          ? __('Add another choice', Constants.TEXT_DOMAIN)
                          : __(
                              'Start by adding a choice',
                              Constants.TEXT_DOMAIN,
                            )
                      }
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
          // TODO remove because not actually used here
          <StatusInfoDisplay
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
