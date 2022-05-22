import { InnerBlocks, useBlockProps } from '@wordpress/block-editor';
import { Fill } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { useContext, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { differenceWith, filter, find, map } from 'lodash';
import {
  ATTR_LINKED_DATA_KEY,
  createPreviewBlockFromBadge,
} from 'src/js/block/helper/data-layout-preview';
import {
  LetterContentContext,
  LetterTemplateContext,
} from 'src/js/block/letter-template';
import EditorLabelWrapper from 'src/js/component/editor-label-wrapper';
import MessageDisplay from 'src/js/component/message-display';
import SingleBlockAppender from 'src/js/component/single-block-appender';
import * as Constants from 'src/js/constants';
import {
  LETTER_DATA_LAYOUT_INFO,
  OPTION_DATA_KEY,
} from 'src/js/constants/data-element';
import {
  getInnerBlocks,
  slotName,
  tryRegisterBlockType,
} from 'src/js/utils/block';

tryRegisterBlockType(LETTER_DATA_LAYOUT_INFO.name, {
  ...LETTER_DATA_LAYOUT_INFO,
  apiVersion: 2,
  category: Constants.CATEGORY_LETTER_TEMPLATE,
  parent: [Constants.BLOCK_LETTER_TEMPLATE],
  edit({ clientId, attributes, setAttributes }) {
    // determine if any new previews need to be added
    const { templateClientId, updateNumLayoutPreviews } = useContext(
        LetterTemplateContext,
      ),
      { badges } = useContext(LetterContentContext),
      // DO NOT filter for only `BLOCK_DATA_LAYOUT_PREVIEW` because we need to preserve the position
      // of the `BLOCK_DATA_LAYOUT_SECTION`
      dataPreviewsAndSections = useSelect((select) =>
        getInnerBlocks(clientId, select),
      ),
      showEmptyState = dataPreviewsAndSections.length === 0,
      { replaceInnerBlocks } = useDispatch(Constants.STORE_BLOCK_EDITOR);
    // Track number of data element previews for the tab badge
    useEffect(
      () =>
        updateNumLayoutPreviews(
          filter(dataPreviewsAndSections, [
            'name',
            Constants.BLOCK_DATA_LAYOUT_PREVIEW,
          ]).length,
        ),
      [dataPreviewsAndSections.length],
    );
    // Tracks badges to add or remove based on data element and letter content changes
    useEffect(() => {
      if (badges === null) {
        return;
      }
      // 1. Figure out which badges to add as previews
      const badgesToAdd = differenceWith(
        badges,
        dataPreviewsAndSections,
        // A data element can have several types of badges. For example, an options data element has
        // one badge for each of its choices. By comparing by the dataKey here, we ensure that all badges
        // that correspond to the same data element are considered equal so we don't accidentally add
        // duplicate data element previews
        (badge, previewOrSection) =>
          previewOrSection.name === Constants.BLOCK_DATA_LAYOUT_PREVIEW &&
          badge[OPTION_DATA_KEY] ===
            previewOrSection.attributes[ATTR_LINKED_DATA_KEY],
      );
      // 2. Figure out which data previews to keep (and update) and which to remove
      const updatedDataPreviewsOrSectionsToKeep = filter(
        map(dataPreviewsAndSections, (previewOrSection) => {
          if (previewOrSection.name === Constants.BLOCK_DATA_LAYOUT_PREVIEW) {
            const badge = find(badges, [
              OPTION_DATA_KEY,
              previewOrSection.attributes[ATTR_LINKED_DATA_KEY],
            ]);
            // 1. If badge is found, recreate the preview block from badge to ensure that the preview
            // has the latest data to display
            // 2. If a badge is NOT found for this preview, this means that the badge was removed
            // and that this preview should also be removed. We return `null` and then `filter`
            // the resulting array to ensure that this preview is not added to the list of new
            // inner blocks to render in the layout tab
            return badge ? createPreviewBlockFromBadge(badge) : null;
          } else {
            return previewOrSection;
          }
        }),
      );
      // 3. Build new previews and sections, with newly-added previews (from badges) at the top
      const newInnerBlocks = [
        ...map(badgesToAdd, createPreviewBlockFromBadge),
        ...updatedDataPreviewsOrSectionsToKeep,
      ];
      // No need to check if `newInnerBlocks` is equal to previous inner blocks because this `useEffect`
      // hook is only called if an addition, removal, or update is needed
      replaceInnerBlocks(clientId, newInnerBlocks);
    }, [badges, badges?.length]);
    return (
      <Fill name={slotName(LETTER_DATA_LAYOUT_INFO.name, templateClientId)}>
        <div {...useBlockProps()}>
          {showEmptyState && (
            <MessageDisplay
              title={__('No layout items yet!', Constants.TEXT_DOMAIN)}
            >
              {__(
                'Any data elements added to the template content will appear here for you to reorder and group by sections. The layout specified here is what your users will see as they fill out the template.',
                Constants.TEXT_DOMAIN,
              )}
            </MessageDisplay>
          )}
          <EditorLabelWrapper label={LETTER_DATA_LAYOUT_INFO.title}>
            {(id) => (
              <div
                id={id}
                tabIndex="0"
                className="data-layout-preview-container"
              >
                <InnerBlocks
                  templateLock={Constants.INNER_BLOCKS_UNLOCKED}
                  allowedBlocks={[
                    Constants.BLOCK_DATA_LAYOUT_PREVIEW,
                    Constants.BLOCK_DATA_LAYOUT_SECTION,
                  ]}
                  renderAppender={() => (
                    <SingleBlockAppender
                      label={__('Add a section divider', Constants.TEXT_DOMAIN)}
                      blockName={Constants.BLOCK_DATA_LAYOUT_SECTION}
                      clientId={clientId}
                    />
                  )}
                />
              </div>
            )}
          </EditorLabelWrapper>
        </div>
      </Fill>
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
