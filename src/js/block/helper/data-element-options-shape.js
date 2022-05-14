import { InnerBlocks, useBlockProps } from '@wordpress/block-editor';
import { Button, Fill } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useContext, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { SlotNameContext } from 'src/js/block/helper/data-element-options';
import Overlay from 'src/js/component/data-element/overlay';
import EditorLabelWrapper from 'src/js/component/editor-label-wrapper';
import HelpLabel from 'src/js/component/help-label';
import SingleBlockAppender from 'src/js/component/single-block-appender';
import * as Constants from 'src/js/constants';
import { countInnerBlocks, tryRegisterBlockType } from 'src/js/utils/block';

const shapeLabel = __(
  'What kind of data does each option contain?',
  Constants.TEXT_DOMAIN,
);

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
          <HelpLabel
            text={__(
              'Specify what sort of data each option contains',
              Constants.TEXT_DOMAIN,
            )}
          >
            <Button
              {...useBlockProps({ className: 'data-element__control' })}
              onClick={() => setIsOverlayOpen(true)}
            >
              {__('Edit option data', Constants.TEXT_DOMAIN) +
                ' (' +
                numInnerBlocks +
                ')'}
            </Button>
          </HelpLabel>
        </Fill>
        {(forceOverlayOpen || isOverlayOpen) && (
          <Fill name={overlaySlotName}>
            <Overlay
              title={
                forceOverlayOpen
                  ? shapeLabel
                  : __('Editing data for each option', Constants.TEXT_DOMAIN)
              }
              onClose={() => setIsOverlayOpen(false)}
              showClose={!forceOverlayOpen}
            >
              <EditorLabelWrapper label={shapeLabel}>
                {(id) => (
                  <div
                    id={id}
                    tabIndex="0"
                    className="data-element-options-shape"
                  >
                    <InnerBlocks
                      templateLock={Constants.INNER_BLOCKS_UNLOCKED}
                      allowedBlocks={[Constants.BLOCK_DATA_ELEMENT_TEXT]}
                      renderAppender={() => (
                        <SingleBlockAppender
                          label={
                            forceOverlayOpen
                              ? __(
                                  'Start by adding a option data attribute',
                                  Constants.TEXT_DOMAIN,
                                )
                              : __(
                                  'Add another option data attribute',
                                  Constants.TEXT_DOMAIN,
                                )
                          }
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
