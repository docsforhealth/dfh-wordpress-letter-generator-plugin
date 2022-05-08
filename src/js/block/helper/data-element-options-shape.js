import { InnerBlocks, useBlockProps } from '@wordpress/block-editor';
import { useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import EditorLabelWrapper from 'src/js/component/editor-label-wrapper';
import SingleBlockAppender from 'src/js/component/single-block-appender';
import * as Constants from 'src/js/constants';
import { countInnerBlocks, tryRegisterBlockType } from 'src/js/utils/block';

tryRegisterBlockType(Constants.BLOCK_DATA_ELEMENT_OPTIONS_SHAPE, {
  apiVersion: 2,
  title: __('Shape for Options Data Element', Constants.TEXT_DOMAIN),
  category: Constants.CATEGORY_LETTER_TEMPLATE,
  icon: 'tagcloud',
  description: __(
    'Specify the data that each option contains',
    Constants.TEXT_DOMAIN,
  ),
  supports: { inserter: false },
  edit({ clientId, attributes, setAttributes }) {
    // will fire on every render because no clear dependency
    const numInnerBlocks = useSelect((select) =>
      countInnerBlocks(clientId, select),
    );
    return (
      <div {...useBlockProps()}>
        <EditorLabelWrapper
          label={__(
            'What data does each option contain?',
            Constants.TEXT_DOMAIN,
          )}
          collapsible
          startOpen={!numInnerBlocks} // start open if empty
        >
          {(id) => (
            <div id={id} tabIndex="0">
              <InnerBlocks
                templateLock={Constants.INNER_BLOCKS_UNLOCKED}
                allowedBlocks={[Constants.BLOCK_DATA_ELEMENT_TEXT]}
                renderAppender={() => (
                  <SingleBlockAppender
                    label={__('Add value attribute', Constants.TEXT_DOMAIN)}
                    blockName={Constants.BLOCK_DATA_ELEMENT_TEXT}
                    clientId={clientId}
                    deemphasized
                  />
                )}
              />
            </div>
          )}
        </EditorLabelWrapper>
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
