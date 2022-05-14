import { InnerBlocks, useBlockProps } from '@wordpress/block-editor';
import { Fill, ToggleControl } from '@wordpress/components';
import { createContext, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Icon, list } from '@wordpress/icons';
import { isEqual, map, throttle } from 'lodash';
import merge from 'lodash.merge';
import {
  CONTEXT_SHAPE_DEFINITION,
  CONTEXT_SHAPE_KEY,
  EXPECTED_VISIBLE_ATTRS,
} from 'src/js/block/helper/data-element-options-option';
import {
  ATTR_VISIBLE_CONTROLS,
  CONTEXT_VISIBLE_CONTROLS_DEFINITION,
  CONTEXT_VISIBLE_CONTROLS_KEY,
  Edit,
  Save,
  SHARED_CONFIG,
  validateBlockInfo as validateBaseBlockInfo,
} from 'src/js/block/shared/data-element';
import HelpLabel from 'src/js/component/help-label';
import * as Constants from 'src/js/constants';
import { markAttrHiddenInApi } from 'src/js/utils/api';
import {
  tryFindBlockInfoFromName,
  tryRegisterBlockType,
} from 'src/js/utils/block';
import {
  reconcileVisibleAttrsAndContext,
  shouldShowControl,
} from 'src/js/utils/data-element';

export const INFO = {
  name: Constants.BLOCK_DATA_ELEMENT_OPTIONS,
  icon: list,
  title: __('Options Element', Constants.TEXT_DOMAIN),
  description: __(
    'Allow selection of predefined options or user-specified option',
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

// Create a React Context so that `BLOCK_DATA_ELEMENT_OPTIONS_SHAPE` can access
// its slot name without needing to persist an attribute if using WP's Context implementation
export const SlotNameContext = createContext();

// Extend the default `validateBlockInfo` implementation
export function validateBlockInfo(blockInfo) {
  const errors = [...validateBaseBlockInfo(blockInfo)],
    shapeDataElementBlocks = getShapeDataElementBlocks(clientId);
  if (shapeDataElementBlocks.length) {
    // If FIRST ELEMENT within inner blocks array exists, then check its validity
    // For this options data element to be valid, we only need at least one shape block to be valid
    // Assume that all inner blocks are `BLOCK_DATA_ELEMENT_TEXT`, which uses the base block validation
    errors.push(...validateBaseBlockInfo(shapeDataElementBlocks[0]));
  } else {
    errors.push(
      __('Please specify the data each option contains', Constants.TEXT_DOMAIN),
    );
  }
  return errors;
}

tryRegisterBlockType(
  INFO.name,
  merge({}, SHARED_CONFIG, INFO, {
    apiVersion: 2,
    attributes: {
      [ATTR_OTHER_OPTION]: { type: 'boolean', default: false },
      [ATTR_SHAPE_VALUE]: CONTEXT_SHAPE_DEFINITION,
      [ATTR_SHAPE_VISIBLE_CONTROLS]: {
        ...CONTEXT_VISIBLE_CONTROLS_DEFINITION,
        default: EXPECTED_VISIBLE_ATTRS,
      },
      // This is a no-op for `shouldShowControl` functionality. The actual examples are managed
      // and saved by `InnerBlocks`
      [ATTR_NOOP_SHOW_OPTIONS]: { type: 'null' },
    },
    providesContext: {
      [CONTEXT_SHAPE_KEY]: ATTR_SHAPE_VALUE,
      [CONTEXT_VISIBLE_CONTROLS_KEY]: ATTR_SHAPE_VISIBLE_CONTROLS,
    },
    edit({ clientId, context, attributes, setAttributes }) {
      const visibleControls = reconcileVisibleAttrsAndContext(
        attributes[ATTR_VISIBLE_CONTROLS],
        context[CONTEXT_VISIBLE_CONTROLS_KEY],
      );
      // Shape is an array of data element block attributes
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
        <Edit
          {...useBlockProps()}
          clientId={clientId}
          context={context}
          attributes={attributes}
          setAttributes={setAttributes}
        >
          {({
            headerSlotName,
            togglesSlotName,
            secondaryControlsSlotName,
            overlaySlotName,
          }) => (
            <SlotNameContext.Provider
              value={{ secondaryControlsSlotName, overlaySlotName }}
            >
              <Fill name={headerSlotName}>
                <HelpLabel
                  wrapperElementType="div"
                  wrapperProps={{ className: 'data-element__header__icon' }}
                  text={INFO.title}
                >
                  <Icon icon={INFO.icon} />
                </HelpLabel>
              </Fill>
              <Fill name={togglesSlotName}>
                {shouldShowControl(visibleControls, ATTR_OTHER_OPTION) && (
                  <HelpLabel
                    wrapperElementType="div"
                    text={__(
                      'Allow users to enter their own values in an "Other" option',
                      Constants.TEXT_DOMAIN,
                    )}
                  >
                    <ToggleControl
                      className="data-element__control"
                      label={__('Allow "Other"', Constants.TEXT_DOMAIN)}
                      checked={attributes[ATTR_OTHER_OPTION]}
                      onChange={(hasOtherOption) =>
                        setAttributes({
                          [ATTR_OTHER_OPTION]: hasOtherOption,
                        })
                      }
                    />
                  </HelpLabel>
                )}
              </Fill>
              {shouldShowControl(visibleControls, ATTR_NOOP_SHOW_OPTIONS) && (
                <InnerBlocks
                  templateLock={Constants.INNER_BLOCKS_LOCKED}
                  template={[
                    [Constants.BLOCK_DATA_ELEMENT_OPTIONS_SHAPE],
                    [Constants.BLOCK_DATA_ELEMENT_OPTIONS_CHOICES],
                  ]}
                />
              )}
            </SlotNameContext.Provider>
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
