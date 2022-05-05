import { InnerBlocks, useBlockProps } from '@wordpress/block-editor';
import { createBlock } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import { symbolFilled } from '@wordpress/icons';
import { filter } from 'lodash';
import { INFO as IMAGE_INFO } from 'src/js/block/helper/data-element-image';
import { INFO as OPTIONS_INFO } from 'src/js/block/helper/data-element-options';
import { INFO as TEXT_INFO } from 'src/js/block/helper/data-element-text';
import AutoLabelAppender from 'src/js/component/auto-label-appender';
import EditorLabelWrapper from 'src/js/component/editor-label-wrapper';
import PlaceholderWithOptions from 'src/js/component/placeholder-with-options';
import * as Constants from 'src/js/constants';
import useInsertBlock from 'src/js/hook/use-insert-block';
import { tryRegisterBlockType } from 'src/js/utils/block';

export const ICON = symbolFilled;

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
    deemphasizeAppender: { type: 'boolean', default: false },
    useButtonAppender: { type: 'boolean', default: false },
    isLocked: { type: 'boolean', default: false },
    allowImages: { type: 'boolean', default: true },
    allowOptions: { type: 'boolean', default: true },
    allowText: { type: 'boolean', default: true },
  },
  edit({ attributes, setAttributes, clientId }) {
    const insertBlock = useInsertBlock(clientId),
      onSelect = ({ type }) => insertBlock(createBlock(type));
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
                allowedBlocks={filter([
                  attributes.allowImages && IMAGE_INFO.type,
                  attributes.allowOptions && OPTIONS_INFO.type,
                  attributes.allowText && TEXT_INFO.type,
                ])}
                renderAppender={() =>
                  attributes.useButtonAppender ? (
                    <AutoLabelAppender
                      deemphasized={attributes.deemphasizeAppender}
                      label={attributes.appenderLabel}
                    />
                  ) : (
                    <PlaceholderWithOptions
                      className={
                        attributes.deemphasizeAppender
                          ? 'placeholder-with-options--small'
                          : ''
                      }
                      icon={ICON}
                      label={attributes.appenderLabel}
                      options={filter([
                        attributes.allowImages && {
                          ...IMAGE_INFO,
                          label: IMAGE_INFO.title,
                          onSelect,
                        },
                        attributes.allowOptions && {
                          ...OPTIONS_INFO,
                          label: OPTIONS_INFO.title,
                          onSelect,
                        },
                        attributes.allowText && {
                          ...TEXT_INFO,
                          label: TEXT_INFO.title,
                          onSelect,
                        },
                      ])}
                    />
                  )
                }
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
