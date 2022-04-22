import { InnerBlocks, useBlockProps } from '@wordpress/block-editor';
import { registerBlockType } from '@wordpress/blocks';
import {
  SelectControl,
  TextControl,
  ToggleControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import _ from 'lodash';
import merge from 'lodash.merge';
import { config, Edit } from 'src/js/block/shared/data-element';
import AutoLabelAppender from 'src/js/component/auto-label-appender';
import * as Constants from 'src/js/constants';

// TODO
// TODO React component to label InnerBlocks (and later on, RichText)

const ATTR_TYPE_SHORT = 'text-short';
const ATTR_TYPE_LONG = 'text-long';
const ATTR_TYPE_DATE = 'text-date';
const ATTR_TYPE_PHONE_NUM = 'text-phone-number';
const TYPE_TO_LABEL = {
  [ATTR_TYPE_SHORT]: 'Short text',
  [ATTR_TYPE_LONG]: 'Long text',
  [ATTR_TYPE_DATE]: 'Date',
  [ATTR_TYPE_PHONE_NUM]: 'Phone number',
};
export const ATTR_TYPE_OPTIONS = _.keys(TYPE_TO_LABEL);

registerBlockType(
  Constants.BLOCK_DATA_ELEMENT_TEXT,
  merge(config, {
    apiVersion: 2,
    title: __('Text Data Element', Constants.TEXT_DOMAIN),
    icon: 'editor-paragraph',
    description: __(
      'Customize a text-based data element',
      Constants.TEXT_DOMAIN,
    ),
    attributes: {
      type: { enum: ATTR_TYPE_OPTIONS },
      placeholder: { type: 'string' },
      showContextBefore: { type: 'boolean', default: false },
    },
    edit(props) {
      const { attributes, setAttributes } = props;
      return (
        <Edit {...props} {...useBlockProps()}>
          <SelectControl
            label={__('Text element type', Constants.TEXT_DOMAIN)}
            value={attributes.type}
            onChange={(type) => setAttributes({ type })}
            options={[
              {
                label: __('Select a type...', Constants.TEXT_DOMAIN),
                value: '',
                disabled: true,
              },
              ..._.map(TYPE_TO_LABEL, (type, label) => ({
                label,
                value: type,
              })),
            ]}
          />
          <TextControl
            label={__('Placeholder', Constants.TEXT_DOMAIN)}
            value={attributes.placeholder}
            onChange={(placeholder) => setAttributes({ placeholder })}
          />
          <ToggleControl
            label={__('Show context?', Constants.TEXT_DOMAIN)}
            checked={attributes.showContextBefore}
            onChange={(showContextBefore) =>
              setAttributes({ showContextBefore })
            }
          />
          <InnerBlocks
            allowedBlocks={[Constants.DFH_BLOCK_TEXT]}
            renderAppender={() => (
              <AutoLabelAppender
                deemphasized={true}
                label={__('Add example', Constants.TEXT_DOMAIN)}
              />
            )}
          />
        </Edit>
      );
    },
  }),
);
