import { InnerBlocks, useBlockProps } from '@wordpress/block-editor';
import { Button, Fill } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useContext, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { SlotNameContext } from 'src/js/block/helper/data-element-options';
import Overlay from 'src/js/component/data-element/overlay';
import EditorLabelWrapper from 'src/js/component/editor-label-wrapper';
import HelpIcon from 'src/js/component/help-icon';
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
    const { secondaryControlsSlotName, overlaySlotName } =
      useContext(SlotNameContext);
    // will fire on every render because no clear dependency
    const numInnerBlocks = useSelect((select) =>
      countInnerBlocks(clientId, select),
    );
    // force user to specify shape before specifying any options
    const forceOverlayOpen = numInnerBlocks === 0;
    const [isOverlayOpen, setIsOverlayOpen] = useState(forceOverlayOpen);
    return (
      <>
        <Fill name={secondaryControlsSlotName}>
          <div {...useBlockProps()}>
            <Button
              className="data-element__button"
              onClick={() => setIsOverlayOpen(true)}
            >
              {__('Edit shape', Constants.TEXT_DOMAIN)}
              <HelpIcon
                text={__(
                  'The shape determines what sort of data each option contains',
                  Constants.TEXT_DOMAIN,
                )}
              />
            </Button>
          </div>
        </Fill>
        {(forceOverlayOpen || isOverlayOpen) && (
          <Fill name={overlaySlotName}>
            <Overlay
              title={__('Editing option shape', Constants.TEXT_DOMAIN)}
              onClose={() => setIsOverlayOpen(false)}
              showClose={!forceOverlayOpen}
            >
              <EditorLabelWrapper
                label={__(
                  'What data does each option contain?',
                  Constants.TEXT_DOMAIN,
                )}
              >
                {(id) => (
                  <div id={id} tabIndex="0">
                    <InnerBlocks
                      templateLock={Constants.INNER_BLOCKS_UNLOCKED}
                      allowedBlocks={[Constants.BLOCK_DATA_ELEMENT_TEXT]}
                      renderAppender={() => (
                        <SingleBlockAppender
                          label={__(
                            'Add shape attribute',
                            Constants.TEXT_DOMAIN,
                          )}
                          blockName={Constants.BLOCK_DATA_ELEMENT_TEXT}
                          clientId={clientId}
                          deemphasized
                        />
                      )}
                    />
                  </div>
                )}
              </EditorLabelWrapper>
            </Overlay>
          </Fill>
        )}
      </>
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
