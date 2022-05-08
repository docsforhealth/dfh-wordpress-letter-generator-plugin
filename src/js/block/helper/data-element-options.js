import { InnerBlocks, useBlockProps } from '@wordpress/block-editor';
import { ToggleControl } from '@wordpress/components';
import { useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { list } from '@wordpress/icons';
import { isEqual, map, throttle } from 'lodash';
import merge from 'lodash.merge';
import * as Option from 'src/js/block/helper/data-element-options-option';
import { validateBlockInfo as validateTextBlockInfo } from 'src/js/block/helper/data-element-text';
import * as DataElement from 'src/js/block/shared/data-element';
import * as Constants from 'src/js/constants';
import { markAttrHiddenInApi } from 'src/js/utils/api';
import {
  tryFindBlockInfoFromName,
  tryRegisterBlockType,
} from 'src/js/utils/block';

export const INFO = {
  name: Constants.BLOCK_DATA_ELEMENT_OPTIONS,
  icon: list,
  title: __('Options Element', Constants.TEXT_DOMAIN),
  description: __(
    'Allows selection of predefined options or user-specified option',
    Constants.TEXT_DOMAIN,
  ),
};
export const ATTR_OTHER_OPTION = 'hasOtherOption';
export const ATTR_NOOP_SHOW_OPTIONS = markAttrHiddenInApi('noopShowOptions');
export const ATTR_SHAPE_VALUE = markAttrHiddenInApi('shapeOfValue'); // TODO do we need to `markAttrHiddenInApi`??

const ATTR_SHAPE_VISIBLE_CONTROLS = markAttrHiddenInApi('shapeVisibleControls');
const tryUpdateShape = throttle((oldShape, newShape, updateShape) => {
  if (!isEqual(oldShape, newShape)) {
    updateShape(newShape);
  }
}, 250);

// Extend the default `validateBlockInfo` implementation
export function validateBlockInfo(blockInfo) {
  const errors = [...DataElement.validateBlockInfo(blockInfo)],
    shapeDataElementBlocks = getShapeDataElementBlocks(clientId);
  if (shapeDataElementBlocks.length) {
    // If FIRST ELEMENT within inner blocks array exists, then check its validity
    // For this options data element to be valid, we only need at least one shape block to be valid
    // Assume that all inner blocks are `BLOCK_DATA_ELEMENT_TEXT`
    errors.push(...validateTextBlockInfo(shapeDataElementBlocks[0]));
  } else {
    errors.push(
      __('Please specify the data each option contains', Constants.TEXT_DOMAIN),
    );
  }
  return errors;
}

tryRegisterBlockType(
  INFO.name,
  merge({}, DataElement.SHARED_CONFIG, INFO, {
    apiVersion: 2,
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
      const currentShape = map(
        getShapeDataElementBlocks(clientId),
        'attributes',
      );
      // rate limited, update `ATTR_SHAPE_VALUE` from InnerBlocks within `BLOCK_DATA_ELEMENTS`
      useEffect(
        () => {
          tryUpdateShape(
            attributes[ATTR_SHAPE_VALUE],
            currentShape,
            (newShape) => setAttributes({ [ATTR_SHAPE_VALUE]: newShape }),
          );
          return tryUpdateShape.cancel;
        },
        // comparing object dependencies not always reliable so still throttle just in case
        [attributes[ATTR_SHAPE_VALUE], currentShape],
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
                  [Constants.BLOCK_DATA_ELEMENT_OPTIONS_SHAPE],
                  [Constants.BLOCK_DATA_ELEMENT_OPTIONS_CHOICES],
                ]}
              />
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

// ***********
// * Helpers *
// ***********

function getShapeDataElementBlocks(clientId) {
  return (
    tryFindBlockInfoFromName(
      Constants.BLOCK_DATA_ELEMENT_OPTIONS_SHAPE,
      clientId,
    )?.innerBlocks ?? []
  );
}
