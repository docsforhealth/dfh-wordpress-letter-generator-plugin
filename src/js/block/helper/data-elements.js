import { InnerBlocks, useBlockProps } from '@wordpress/block-editor';
import { createBlock } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import { symbolFilled } from '@wordpress/icons';
import { filter, includes } from 'lodash';
import { INFO as IMAGE_INFO } from 'src/js/block/helper/data-element-image';
import { INFO as OPTIONS_INFO } from 'src/js/block/helper/data-element-options';
import { INFO as TEXT_INFO } from 'src/js/block/helper/data-element-text';
import { INFO as SECTION_INFO } from 'src/js/block/helper/data-elements-section';
import EditorLabelWrapper from 'src/js/component/editor-label-wrapper';
import PlaceholderWithOptions from 'src/js/component/placeholder-with-options';
import * as Constants from 'src/js/constants';
import useInsertBlock from 'src/js/hook/use-insert-block';
import {
  tryFindBlockInfoFromName,
  tryRegisterBlockType,
} from 'src/js/utils/block';

export const ICON = symbolFilled;

/**
 * Returns only the data elements from `BLOCK_DATA_ELEMENTS`, filtering out any section blocks
 * @param  {String} clientId Either the clientId of the `BLOCK_DATA_ELEMENTS` block or a parent block
 * @return {Array}           Array of blockInfo objects for the found data elements
 */
export function getOnlyDataElementsFromClientId(clientId) {
  const dataElementBlocks = [];
  if (clientId) {
    // Will start the breadth-first search for `BLOCK_DATA_ELEMENTS` from the provided clientId
    const blockInfo = tryFindBlockInfoFromName(
        Constants.BLOCK_DATA_ELEMENTS,
        clientId,
      ),
      dataElementNames = [IMAGE_INFO.name, OPTIONS_INFO.name, TEXT_INFO.name];
    dataElementBlocks.push(
      ...filter(blockInfo?.innerBlocks, (block) =>
        includes(dataElementNames, block.name),
      ),
    );
  }
  return dataElementBlocks;
}

tryRegisterBlockType(Constants.BLOCK_DATA_ELEMENTS, {
  apiVersion: 2,
  title: __('Data Elements', Constants.TEXT_DOMAIN),
  category: Constants.CATEGORY_LETTER_TEMPLATE,
  icon: ICON,
  description: __(
    'Specify definitions for data elements',
    Constants.TEXT_DOMAIN,
  ),
  attributes: {
    label: {
      type: 'string',
      default: __('Data elements', Constants.TEXT_DOMAIN),
    },
    appenderLabel: {
      type: 'string',
      default: __('Add data element', Constants.TEXT_DOMAIN),
    },
    isLocked: { type: 'boolean', default: false },
  },
  edit({ attributes, setAttributes, clientId }) {
    const insertBlock = useInsertBlock(clientId),
      onSelect = ({ name }) => insertBlock(createBlock(name));
    return (
      <div {...useBlockProps()}>
        <EditorLabelWrapper label={attributes.label}>
          {(id) => (
            <div id={id} tabIndex="0">
              <InnerBlocks
                templateLock={
                  attributes.isLocked
                    ? Constants.INNER_BLOCKS_LOCKED
                    : Constants.INNER_BLOCKS_UNLOCKED
                }
                // NOTE we can't actually prevent any of these four block types from showing up
                // since all four have `BLOCK_DATA_ELEMENTS` in their `parents` property, which
                // `allowedBlocks` CANNOT override, see https://github.com/WordPress/gutenberg/issues/32436
                allowedBlocks={[
                  SECTION_INFO.name,
                  IMAGE_INFO.name,
                  OPTIONS_INFO.name,
                  TEXT_INFO.name,
                ]}
                renderAppender={() => (
                  <PlaceholderWithOptions
                    icon={ICON}
                    label={attributes.appenderLabel}
                    options={[
                      {
                        ...IMAGE_INFO,
                        label: IMAGE_INFO.title,
                        onSelect,
                      },
                      {
                        ...OPTIONS_INFO,
                        label: OPTIONS_INFO.title,
                        onSelect,
                      },
                      {
                        ...TEXT_INFO,
                        label: TEXT_INFO.title,
                        onSelect,
                      },
                      {
                        ...SECTION_INFO,
                        label: SECTION_INFO.title,
                        onSelect,
                      },
                    ]}
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
