import {
  BlockControls,
  RichText,
  useBlockProps,
} from '@wordpress/block-editor';
import { registerBlockType } from '@wordpress/blocks';
import { ToolbarButton } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { symbolFilled as SymbolIcon } from '@wordpress/icons';
import EditorLabelWrapper from 'src/js/component/editor-label-wrapper';
import * as Constants from 'src/js/constants';

// TODO enforce requirment for at least 1 data element to be inserted

registerBlockType(Constants.BLOCK_LETTER_CONTENT, {
  apiVersion: 2,
  title: __('Letter Content', Constants.TEXT_DOMAIN),
  category: Constants.CATEGORY_LETTER_TEMPLATE,
  icon: 'text-page',
  description: __(
    'Specify letter content with embedded data elements for a letter template',
    Constants.TEXT_DOMAIN,
  ),
  // supports: { inserter: false }, // TODO
  attributes: {
    content: { type: 'string', default: '' },
  },
  edit({ attributes, setAttributes }) {
    return (
      <div {...useBlockProps()}>
        <EditorLabelWrapper
          label={__('Letter template content', Constants.TEXT_DOMAIN)}
        >
          <RichText
            placeholder={__('Enter template here', Constants.TEXT_DOMAIN)}
            value={attributes.content}
            onChange={(content) => setAttributes({ content })}
            allowedFormats={[Constants.FORMAT_DATA_ELEMENT]}
            autocompleters={[Constants.AUTOCOMPLETE_DATA_ELEMENT]}
            preserveWhiteSpace
          />
        </EditorLabelWrapper>
      </div>
    );
  },
  save() {
    // Should be used within the `save` hook to properly save `content`
    // see https://github.com/WordPress/gutenberg/tree/trunk/packages/block-editor/src/components/rich-text#richtextcontent
    return <RichText.Content />;
  },
});
