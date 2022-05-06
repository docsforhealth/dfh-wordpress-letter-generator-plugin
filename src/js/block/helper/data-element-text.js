import { InnerBlocks, useBlockProps } from '@wordpress/block-editor';
import {
  SelectControl,
  TextControl,
  ToggleControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { paragraph } from '@wordpress/icons';
import { keys } from 'lodash';
import merge from 'lodash.merge';
import * as DataElement from 'src/js/block/shared/data-element';
import AutoLabelAppender from 'src/js/component/auto-label-appender';
import EditorLabelWrapper from 'src/js/component/editor-label-wrapper';
import * as Constants from 'src/js/constants';
import { markAttrHiddenInApi } from 'src/js/utils/api';
import { tryRegisterBlockType } from 'src/js/utils/block';

export const INFO = {
  name: Constants.BLOCK_DATA_ELEMENT_TEXT,
  icon: paragraph,
  title: __('Text Element', Constants.TEXT_DOMAIN),
  description: __('Allows entry of text-based values', Constants.TEXT_DOMAIN),
};

export const ATTR_TYPE = 'textType';
export const ATTR_PLACEHOLDER = 'placeholder';
export const ATTR_CONTEXT_BEFORE = 'showContextBefore';
export const ATTR_NOOP_SHOW_EXAMPLES = markAttrHiddenInApi('noopShowExamples');

// re-export default `validateBlockInfo` implementation
export { validateBlockInfo } from 'src/js/block/shared/data-element';

export const TEXT_TYPE_SHORT = 'text-short';
export const TEXT_TYPE_LONG = 'text-long';
export const TEXT_TYPE_DATE = 'text-date';
export const TEXT_TYPE_PHONE_NUMBER = 'text-phone-number';

const TYPE_DEFAULT_VALUE = '';
const TYPE_TO_LABEL = {
  [TEXT_TYPE_SHORT]: __('Short text', Constants.TEXT_DOMAIN),
  [TEXT_TYPE_LONG]: __('Long text', Constants.TEXT_DOMAIN),
  [TEXT_TYPE_DATE]: __('Date', Constants.TEXT_DOMAIN),
  [TEXT_TYPE_PHONE_NUMBER]: __('Phone number', Constants.TEXT_DOMAIN),
};
export const TEXT_TYPE_VALUES = keys(TYPE_TO_LABEL);

tryRegisterBlockType(
  INFO.name,
  merge({}, DataElement.SHARED_CONFIG, INFO, {
    apiVersion: 2,
    attributes: {
      [ATTR_TYPE]: { type: 'string', default: TEXT_TYPE_SHORT },
      [ATTR_PLACEHOLDER]: { type: 'string', default: '' },
      [ATTR_CONTEXT_BEFORE]: { type: 'boolean', default: false },
      // This is a no-op for `shouldShowControl` functionality. The actual examples are managed
      // and saved by `InnerBlocks`
      [ATTR_NOOP_SHOW_EXAMPLES]: { type: 'null' },
    },
    edit({ clientId, context, attributes, setAttributes }) {
      return (
        <div {...useBlockProps()}>
          <DataElement.Edit
            clientId={clientId}
            context={context}
            attributes={attributes}
            setAttributes={setAttributes}
          >
            {DataElement.shouldShowControl(
              { context, attributes },
              ATTR_TYPE,
            ) && (
              <SelectControl
                label={__('Text element type', Constants.TEXT_DOMAIN)}
                value={attributes[ATTR_TYPE]}
                onChange={(type) => setAttributes({ [ATTR_TYPE]: type })}
                options={[
                  {
                    label: __('Select a type...', Constants.TEXT_DOMAIN),
                    value: TYPE_DEFAULT_VALUE,
                    disabled: true,
                  },
                  ..._.map(TYPE_TO_LABEL, (label, type) => ({
                    label,
                    value: type,
                  })),
                ]}
              />
            )}
            {DataElement.shouldShowControl(
              { context, attributes },
              ATTR_PLACEHOLDER,
            ) && (
              <TextControl
                label={__('Placeholder', Constants.TEXT_DOMAIN)}
                value={attributes[ATTR_PLACEHOLDER]}
                onChange={(placeholder) =>
                  setAttributes({ [ATTR_PLACEHOLDER]: placeholder })
                }
              />
            )}
            {DataElement.shouldShowControl(
              { context, attributes },
              ATTR_CONTEXT_BEFORE,
            ) && (
              <ToggleControl
                label={__('Show context?', Constants.TEXT_DOMAIN)}
                checked={attributes[ATTR_CONTEXT_BEFORE]}
                onChange={(showContextBefore) =>
                  setAttributes({ [ATTR_CONTEXT_BEFORE]: showContextBefore })
                }
              />
            )}
            {DataElement.shouldShowControl(
              { context, attributes },
              ATTR_NOOP_SHOW_EXAMPLES,
            ) && (
              <EditorLabelWrapper
                label={__('Example responses', Constants.TEXT_DOMAIN)}
              >
                {(id) => (
                  <div id={id} tabIndex="0">
                    <InnerBlocks
                      allowedBlocks={[Constants.DFH_BLOCK_TEXT]}
                      renderAppender={() => (
                        <AutoLabelAppender
                          label={__('Add example', Constants.TEXT_DOMAIN)}
                          deemphasized
                        />
                      )}
                    />
                  </div>
                )}
              </EditorLabelWrapper>
            )}
          </DataElement.Edit>
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
  }),
);
