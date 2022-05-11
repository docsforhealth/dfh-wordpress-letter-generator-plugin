import { RichText, useBlockProps } from '@wordpress/block-editor';
import { useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import EditorLabelWrapper from 'src/js/component/editor-label-wrapper';
import * as Constants from 'src/js/constants';
import { markAttrHiddenInApi } from 'src/js/utils/api';
import { tryRegisterBlockType } from 'src/js/utils/block';

export const ATTR_NUM_BADGES = markAttrHiddenInApi('numBadges');

const badgeAttributeRegex = /data-letter-element-key/gm;

tryRegisterBlockType(Constants.BLOCK_LETTER_CONTENT, {
  apiVersion: 2,
  title: __('Letter Content', Constants.TEXT_DOMAIN),
  category: Constants.CATEGORY_LETTER_TEMPLATE,
  icon: 'text-page',
  description: __(
    'Specify letter content with embedded data elements for a letter template',
    Constants.TEXT_DOMAIN,
  ),
  supports: { inserter: false },
  attributes: {
    content: { type: 'string', default: '' },
    [ATTR_NUM_BADGES]: { type: 'number', default: 0 },
  },
  edit({ attributes, setAttributes, clientId }) {
    // Store number of badges for validation in `BLOCK_LETTER_TEMPLATE`
    const numBadges = attributes.content?.match(badgeAttributeRegex)?.length;
    useEffect(() => {
      if (numBadges != attributes[ATTR_NUM_BADGES]) {
        setAttributes({ [ATTR_NUM_BADGES]: numBadges });
      }
    }, [numBadges]);
    return (
      <div {...useBlockProps()}>
        <EditorLabelWrapper
          label={__('Letter template content', Constants.TEXT_DOMAIN)}
        >
          {(id) => (
            <RichText
              id={id}
              placeholder={__('Enter template here', Constants.TEXT_DOMAIN)}
              value={attributes.content}
              onChange={(content) => setAttributes({ content })}
              allowedFormats={[Constants.FORMAT_DATA_ELEMENT]}
              autocompleters={[Constants.AUTOCOMPLETE_DATA_ELEMENT]}
              preserveWhiteSpace
            />
          )}
        </EditorLabelWrapper>
      </div>
    );
  },
  save({ attributes }) {
    // Should be used within the `save` hook to properly save `content`
    // see https://github.com/WordPress/gutenberg/tree/trunk/packages/block-editor/src/components/rich-text#richtextcontent
    return (
      <div {...useBlockProps.save()}>
        <RichText.Content value={attributes.content} />
      </div>
    );
  },
});
