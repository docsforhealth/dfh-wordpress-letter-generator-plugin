import { InnerBlocks, useBlockProps } from '@wordpress/block-editor';
import { registerBlockType } from '@wordpress/blocks';
import { ToggleControl } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { debounce, find, isEqual, map } from 'lodash';
import merge from 'lodash.merge';
import * as Option from 'src/js/block/helper/data-element-options-option';
import * as DataElement from 'src/js/block/shared/data-element';
import * as Constants from 'src/js/constants';
import { markAttrHiddenInApi } from 'src/js/utils';

const ATTR_SHAPE_VALUE = markAttrHiddenInApi('shapeOfValue');
const ATTR_SHAPE_VISIBLE_CONTROLS = markAttrHiddenInApi('shapeVisibleControls');
const tryUpdateShape = debounce((oldShape, newShape, updateShape) => {
  if (!isEqual(oldShape, newShape)) {
    updateShape(newShape);
  }
}, 250);

export const ATTR_OTHER_OPTION = 'hasOtherOption';
export const ATTR_NOOP_SHOW_OPTIONS = markAttrHiddenInApi('noopShowOptions');

registerBlockType(
  Constants.BLOCK_DATA_ELEMENT_OPTIONS,
  merge({}, DataElement.config, {
    apiVersion: 2,
    title: __('Options Data Element', Constants.TEXT_DOMAIN),
    icon: 'list-view',
    description: __(
      'Customize an options-based data element',
      Constants.TEXT_DOMAIN,
    ),
    attributes: {
      [ATTR_OTHER_OPTION]: { type: 'boolean', default: false },
      [ATTR_SHAPE_VALUE]: Option.CONTEXT_SHAPE_DEFINITION,
      [ATTR_SHAPE_VISIBLE_CONTROLS]: {
        ...DataElement.CONTEXT_VISIBLE_CONTROLS_DEFINITION,
        default: Option.EXPECTED_VISIBLE_ATTRS,
      },
      // This is a no-op for `shouldShowControl` functionality. The actual examples are managed
      // and saved by `InnerBlocks`
      [ATTR_NOOP_SHOW_OPTIONS]: { type: 'null' },
    },
    providesContext: {
      [Option.CONTEXT_SHAPE_KEY]: ATTR_SHAPE_VALUE,
      [DataElement.CONTEXT_VISIBLE_CONTROLS_KEY]: ATTR_SHAPE_VISIBLE_CONTROLS,
    },
    edit({ clientId, context, attributes, setAttributes }) {
      const currentShape = useSelect(
        (select) =>
          map(
            find(
              select(Constants.STORE_BLOCK_EDITOR).getBlock(clientId)
                ?.innerBlocks,
              ['name', Constants.BLOCK_DATA_ELEMENTS],
            )?.innerBlocks,
            'attributes',
          ) ?? [],
      );
      // debounced, update `ATTR_SHAPE_VALUE` from InnerBlocks within `BLOCK_DATA_ELEMENTS`
      useEffect(() =>
        tryUpdateShape(attributes[ATTR_SHAPE_VALUE], currentShape, (newShape) =>
          setAttributes({ [ATTR_SHAPE_VALUE]: newShape }),
        ),
      );
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
              ATTR_OTHER_OPTION,
            ) && (
              <ToggleControl
                label={__('Allow "Other" option?', Constants.TEXT_DOMAIN)}
                checked={attributes[ATTR_OTHER_OPTION]}
                onChange={(hasOtherOption) =>
                  setAttributes({ [ATTR_OTHER_OPTION]: hasOtherOption })
                }
              />
            )}
            {DataElement.shouldShowControl(
              { context, attributes },
              ATTR_NOOP_SHOW_OPTIONS,
            ) && (
              <InnerBlocks
                templateLock={Constants.INNER_BLOCKS_LOCKED}
                template={[
                  [
                    Constants.BLOCK_DATA_ELEMENTS,
                    {
                      label: __(
                        'What data does each option contain?',
                        Constants.TEXT_DOMAIN,
                      ),
                      appenderLabel: __(
                        'Add value attribute',
                        Constants.TEXT_DOMAIN,
                      ),
                      deemphasizeAppender: true,
                      // `BLOCK_DATA_ELEMENT_OPTIONS_OPTION` only supports text
                      allowText: true,
                      allowImages: false,
                      allowOptions: false,
                    },
                  ],
                  [Constants.BLOCK_DATA_ELEMENT_OPTIONS_CHOICES],
                ]}
              />
            )}
          </DataElement.Edit>
        </div>
      );
    },
    save() {
      return <InnerBlocks.Content />;
    },
  }),
);
