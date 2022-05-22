import { useBlockProps } from '@wordpress/block-editor';
import { TextControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { pageBreak } from '@wordpress/icons';
import * as Constants from 'src/js/constants';
import { tryRegisterBlockType } from 'src/js/utils/block';

// NOTE: no ID so should not be treated as an independent entity in the API

tryRegisterBlockType(Constants.BLOCK_DATA_LAYOUT_SECTION, {
  apiVersion: 2,
  title: __('Data Layout Section', Constants.TEXT_DOMAIN),
  category: Constants.CATEGORY_LETTER_TEMPLATE,
  icon: pageBreak,
  description: __('A section of data elements', Constants.TEXT_DOMAIN),
  parent: [Constants.BLOCK_LETTER_DATA_LAYOUT],
  attributes: {
    title: { type: 'string', default: '' },
  },
  edit({ attributes, setAttributes }) {
    return (
      <div {...useBlockProps({ className: 'data-layout-section' })}>
        <TextControl
          className="data-layout-section__control"
          label={__('Section title', Constants.TEXT_DOMAIN)}
          value={attributes.title}
          onChange={(title) => setAttributes({ title })}
        />
      </div>
    );
  },
});
