import { InnerBlocks, useBlockProps } from '@wordpress/block-editor';
import {
  Fill,
  SelectControl,
  TextControl,
  ToggleControl,
} from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { keys } from 'lodash';
import merge from 'lodash.merge';
import {
  CONTEXT_VISIBLE_CONTROLS_KEY,
  Edit,
  Save,
  SHARED_CONFIG,
} from 'src/js/block/shared/data-element';
import EditorLabelWrapper, {
  STYLE_FORM_LABEL,
} from 'src/js/component/editor-label-wrapper';
import HelpLabel from 'src/js/component/help-label';
import SingleBlockAppender from 'src/js/component/single-block-appender';
import * as Constants from 'src/js/constants';
import {
  ATTR_CONTEXT_BEFORE,
  ATTR_NOOP_SHOW_EXAMPLES,
  ATTR_PLACEHOLDER,
  ATTR_TEXT_TYPE,
  ATTR_VISIBLE_CONTROLS,
  TEXT_INFO,
} from 'src/js/constants/data-element';
import { API_CONFIG_INNER_BLOCKS_HAS_MANY } from 'src/js/utils/api';
import { countInnerBlocks, tryRegisterBlockType } from 'src/js/utils/block';
import {
  reconcileVisibleAttrsAndContext,
  shouldShowControl,
} from 'src/js/utils/data-element';

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
  TEXT_INFO.name,
  merge({}, SHARED_CONFIG, TEXT_INFO, {
    apiVersion: 2,
    parent: [Constants.BLOCK_DATA_ELEMENT_OPTIONS_SHAPE], // merged with shared array
    attributes: {
      [API_CONFIG_INNER_BLOCKS_HAS_MANY]: {
        type: 'string',
        default: 'examples',
      },
      [ATTR_TEXT_TYPE]: { type: 'string', default: TEXT_TYPE_SHORT },
      [ATTR_PLACEHOLDER]: { type: 'string', default: '' },
      [ATTR_CONTEXT_BEFORE]: { type: 'boolean', default: false },
      // This is a no-op for `shouldShowControl` functionality. The actual examples are managed
      // and saved by `InnerBlocks`
      [ATTR_NOOP_SHOW_EXAMPLES]: { type: 'null' },
    },
    edit({ clientId, context, attributes, setAttributes }) {
      const numExamples = useSelect((select) =>
        countInnerBlocks(clientId, select),
      );
      const visibleControls = reconcileVisibleAttrsAndContext(
        attributes[ATTR_VISIBLE_CONTROLS],
        context[CONTEXT_VISIBLE_CONTROLS_KEY],
      );
      return (
        <Edit
          {...useBlockProps({ className: 'data-element-text' })}
          clientId={clientId}
          context={context}
          attributes={attributes}
          setAttributes={setAttributes}
        >
          {({
            headerSlotName,
            togglesSlotName,
            helpTriggerSlotName,
            helpOverlaySlotName,
          }) => (
            <>
              <Fill name={headerSlotName}>
                {shouldShowControl(visibleControls, ATTR_TEXT_TYPE) && (
                  <div className="data-element__control data-element-text__type">
                    <SelectControl
                      label={__('Type', Constants.TEXT_DOMAIN)}
                      value={attributes[ATTR_TEXT_TYPE]}
                      onChange={(type) =>
                        setAttributes({ [ATTR_TEXT_TYPE]: type })
                      }
                      options={[
                        {
                          label: __(
                            'Select a text type...',
                            Constants.TEXT_DOMAIN,
                          ),
                          value: TYPE_DEFAULT_VALUE,
                          disabled: true,
                        },
                        ..._.map(TYPE_TO_LABEL, (label, type) => ({
                          label,
                          value: type,
                        })),
                      ]}
                      hideLabelFromVision
                    />
                  </div>
                )}
              </Fill>
              <Fill name={togglesSlotName}>
                {shouldShowControl(visibleControls, ATTR_CONTEXT_BEFORE) && (
                  <HelpLabel
                    wrapperElementType="div"
                    text={__(
                      'Display the sentence leading up to this field to add context',
                      Constants.TEXT_DOMAIN,
                    )}
                  >
                    <ToggleControl
                      className="data-element__control"
                      label={__('Show context', Constants.TEXT_DOMAIN)}
                      checked={attributes[ATTR_CONTEXT_BEFORE]}
                      onChange={(showContextBefore) =>
                        setAttributes({
                          [ATTR_CONTEXT_BEFORE]: showContextBefore,
                        })
                      }
                    />
                  </HelpLabel>
                )}
              </Fill>
              {!!numExamples && (
                // Show number of example responses, if present, in the help button
                <Fill name={helpTriggerSlotName}>
                  {' (' + numExamples + ')'}
                </Fill>
              )}
              {shouldShowControl(visibleControls, ATTR_NOOP_SHOW_EXAMPLES) && (
                <Fill name={helpOverlaySlotName}>
                  <EditorLabelWrapper
                    label={__('Example responses', Constants.TEXT_DOMAIN)}
                    style={STYLE_FORM_LABEL}
                  >
                    {(id) => (
                      <div
                        id={id}
                        tabIndex="0"
                        className="data-element-text__examples"
                      >
                        <InnerBlocks
                          templateLock={Constants.INNER_BLOCKS_UNLOCKED}
                          allowedBlocks={[Constants.DFH_BLOCK_TEXT]}
                          renderAppender={() => (
                            <SingleBlockAppender
                              label={
                                numExamples
                                  ? __(
                                      'Add another example response',
                                      Constants.TEXT_DOMAIN,
                                    )
                                  : __(
                                      'Start by adding an example response',
                                      Constants.TEXT_DOMAIN,
                                    )
                              }
                              blockName={Constants.DFH_BLOCK_TEXT}
                              clientId={clientId}
                              deemphasized
                            />
                          )}
                        />
                      </div>
                    )}
                  </EditorLabelWrapper>
                </Fill>
              )}
              {shouldShowControl(visibleControls, ATTR_PLACEHOLDER) && (
                <div className="data-element__contents__container">
                  <TextControl
                    label={__('Placeholder', Constants.TEXT_DOMAIN)}
                    placeholder={__(
                      'Add some instructions to show when this field is empty...',
                      Constants.TEXT_DOMAIN,
                    )}
                    value={attributes[ATTR_PLACEHOLDER]}
                    onChange={(placeholder) =>
                      setAttributes({ [ATTR_PLACEHOLDER]: placeholder })
                    }
                  />
                </div>
              )}
            </>
          )}
        </Edit>
      );
    },
    save({ attributes }) {
      return (
        <Save {...useBlockProps.save()} attributes={attributes}>
          <InnerBlocks.Content />
        </Save>
      );
    },
  }),
);
