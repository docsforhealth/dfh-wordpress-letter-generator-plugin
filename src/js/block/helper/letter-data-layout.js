import { InnerBlocks, useBlockProps } from '@wordpress/block-editor';
import { useDispatch, useSelect } from '@wordpress/data';
import { useContext, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { blockMeta } from '@wordpress/icons';
import { differenceWith, isEmpty, without } from 'lodash';
import { createPreviewBlockFromBadge } from 'src/js/block/helper/data-layout-preview';
import { LetterContentContext } from 'src/js/block/letter-template';
import EditorLabelWrapper from 'src/js/component/editor-label-wrapper';
import SingleBlockAppender from 'src/js/component/single-block-appender';
import * as Constants from 'src/js/constants';
import { OPTION_DATA_KEY } from 'src/js/constants/data-element';
import { tryRegisterBlockType } from 'src/js/utils/block';

tryRegisterBlockType(Constants.BLOCK_LETTER_DATA_LAYOUT, {
  apiVersion: 2,
  title: __('Letter Data Layout', Constants.TEXT_DOMAIN),
  category: Constants.CATEGORY_LETTER_TEMPLATE,
  icon: blockMeta,
  description: __(
    'Arrange and group local and shared data elements by sections',
    Constants.TEXT_DOMAIN,
  ),
  parent: [Constants.BLOCK_LETTER_TEMPLATE],
  edit({ clientId, attributes, setAttributes }) {
    // determine if any new previews need to be added
    const { badges } = useContext(LetterContentContext),
      // DO NOT filter for only `BLOCK_DATA_LAYOUT_PREVIEW` because we need to preserve the position
      // of the `BLOCK_DATA_LAYOUT_SECTION`
      dataPreviewsAndSections = useSelect(
        (select) =>
          select(Constants.STORE_BLOCK_EDITOR).getBlock(clientId).innerBlocks,
      ),
      { replaceInnerBlocks } = useDispatch(Constants.STORE_BLOCK_EDITOR);
    useEffect(() => {
      if (badges === null) {
        return;
      }
      const badgesToAdd = differenceWith(
        badges,
        dataPreviewsAndSections,
        // A data element can have several types of badges. For example, an options data element has
        // one badge for each of its choices. By comparing by the dataKey here, we ensure that all badges
        // that correspond to the same data element are considered equal so we don't accidentally add
        // duplicate data element previews
        (badge, previewOrSection) =>
          previewOrSection.name === Constants.BLOCK_DATA_LAYOUT_PREVIEW &&
          badge[OPTION_DATA_KEY] === previewOrSection.attributes.linkedDataKey,
      );
      const dataPreviewsToRemove = differenceWith(
        dataPreviewsAndSections,
        badges,
        // Do not remove (1) sections and (2) data previews that have a matching badge
        (previewOrSection, badge) =>
          previewOrSection.name === Constants.BLOCK_DATA_LAYOUT_SECTION ||
          previewOrSection.attributes.linkedDataKey === badge[OPTION_DATA_KEY],
      );
      if (!isEmpty(badgesToAdd) || !isEmpty(dataPreviewsToRemove)) {
        const newInnerBlocks = [
          ...badgesToAdd.map(createPreviewBlockFromBadge),
          ...without(dataPreviewsAndSections, ...dataPreviewsToRemove),
        ];
        // Adds new badges to the top, individual previews handle updating + removing themselves
        replaceInnerBlocks(clientId, newInnerBlocks);
      }
    }, [badges, badges?.length]);
    return (
      <div {...useBlockProps()}>
        <EditorLabelWrapper
          label={__('Data element layout', Constants.TEXT_DOMAIN)}
        >
          {(id) => (
            <div id={id} tabIndex="0" className="data-layout-preview-container">
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
