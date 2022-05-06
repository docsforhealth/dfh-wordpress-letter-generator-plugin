import { useBlockProps } from '@wordpress/block-editor';
import { TextControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { pageBreak } from '@wordpress/icons';
import * as Constants from 'src/js/constants';
import { tryRegisterBlockType } from 'src/js/utils/block';

export const INFO = {
  name: Constants.BLOCK_DATA_ELEMENTS_SECTION,
  icon: pageBreak,
  title: __('Data Elements Section', Constants.TEXT_DOMAIN),
  description: __('A section of data elements', Constants.TEXT_DOMAIN),
};

tryRegisterBlockType(INFO.name, {
  ...INFO,
  apiVersion: 2,
  category: Constants.CATEGORY_LETTER_TEMPLATE,
  parent: [Constants.BLOCK_DATA_ELEMENTS],
  attributes: {
    title: { type: 'string', default: '' },
  },
  edit({ attributes, setAttributes }) {
    return (
      <div {...useBlockProps({ className: 'data-elements-section' })}>
        <TextControl
          className="data-elements-section__control"
          label={__('Section title', Constants.TEXT_DOMAIN)}
          value={attributes.title}
          onChange={(title) => setAttributes({ title })}
        />
      </div>
    );
  },
});
