import { BlockControls } from '@wordpress/block-editor';
import {
  Button,
  ButtonGroup,
  Popover,
  ToolbarButton,
} from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { close, symbolFilled } from '@wordpress/icons';
import { insert, registerFormatType, useAnchorRef } from '@wordpress/rich-text';
import { startsWith, trim } from 'lodash';
import { TRIGGER_PREFIX } from 'src/js/autocomplete/data-element';
import {
  ELEMENT_ATTR_IS_SHARED,
  ELEMENT_ATTR_KEY,
  ELEMENT_ATTR_OPTIONS_SHAPE_KEY,
  ELEMENT_ATTR_ORIGINAL_LABEL,
  ELEMENT_ATTR_TYPE,
  ELEMENT_CLASS_NAME,
  ELEMENT_TAG_NAME,
} from 'src/js/component/data-element-option';
import * as Constants from 'src/js/constants';
import {
  getFormatBounds,
  tryEnsureFormatText,
  tryRemoveFormat,
} from 'src/js/utils';

const title = __('Data Element', Constants.TEXT_DOMAIN);
const settings = {
  title,
  // `object` implies a SELF-CLOSING tag so if true will assume that the tag is self-closing
  // see https://github.com/WordPress/gutenberg/issues/40051#issuecomment-1088836769
  object: false,
  // Besides the `type`, the `tagName` and `className` provided must uniquely identify each format type
  // We sync these with the `data-element-option` component so that `rich-text` will identify that
  // any inserted DataElementOptions are in fact this custom format
  tagName: ELEMENT_TAG_NAME,
  className: ELEMENT_CLASS_NAME,
  // see https://github.com/WordPress/gutenberg/blob/trunk/packages/format-library/src/link/index.js
  // example: https://wordpress.stackexchange.com/a/376740
  attributes: {
    key: ELEMENT_ATTR_KEY,
    shapeKey: ELEMENT_ATTR_OPTIONS_SHAPE_KEY,
    type: ELEMENT_ATTR_TYPE,
    isShared: ELEMENT_ATTR_IS_SHARED,
    originalLabel: ELEMENT_ATTR_ORIGINAL_LABEL,
  },
  edit({ isActive, activeAttributes, value, onChange, onFocus, contentRef }) {
    // This custom format is only available within `BLOCK_LETTER_CONTENT`
    const selectedBlockName = useSelect(
      (select) => select(Constants.STORE_BLOCK_EDITOR).getSelectedBlock()?.name,
    );
    if (selectedBlockName !== Constants.BLOCK_LETTER_CONTENT) {
      return null;
    }
    // 1. Based on the items in the condition this `useEffect` hook is run each time the user
    // enters this format and the returned function is run each time the user leaves
    // 2. Allow only directional key navigation within the badge to prevent users from modifying
    // the tag. Instead, users will use the provided interface elements to modify the data element
    useEffect(() => {
      // short circuit if not within this custom format
      if (!isActive) {
        return;
      }
      // EDGE case where a user is able to backspace at the ending border of the badge in order to
      // progressively delete characters within the badge. We can't prevent this edge case since
      // the cursor is technically outside of the bounds of the badge. However, we can attempt to
      // address this edge case by checking that the text contents of the badge matches the original
      // value. If the text contents of the badge do not match, then we restore the original text.
      tryEnsureFormatText(
        onChange,
        value,
        Constants.FORMAT_DATA_ELEMENT,
        activeAttributes.originalLabel,
      );
      // Prevents most modifications to the label EXCEPT for the edge case noted above
      const onKeyDown = function (event) {
        // 1. most future-proof to use `key` instead of `which` or `keyCode`
        // see https://caniuse.com/?search=event.key
        // see https://stackoverflow.com/a/41656511
        // 2. `key` values are strings NOT numerical codes
        // see https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values
        const { key, metaKey } = event;
        // 1. We can assume that event handler is only bound when the user is within this format
        // 2. prevent default on all keys except for directional arrow keys and keyboard shortcuts that
        // involve the meta key. Backspace and Enter are always prevented to prevent text modification
        if (
          key === 'Backspace' ||
          key === 'Enter' ||
          (!metaKey && !startsWith(key, 'Arrow'))
        ) {
          event.preventDefault();
        }
      };
      // 1. Must apply keyboard events to `contenteditable` parent instead of child element
      // see https://stackoverflow.com/a/18665486
      // 2. We need to ensure that our handler is run BEFORE the `use-enter` keydown handler.
      // Therefore, we bind our handler to the capture phase which happens before the bubbling phase
      // `use-enter` source: https://github.com/WordPress/gutenberg/blob/trunk/packages/block-editor/src/components/rich-text/use-enter.js
      // `useCapture` tip: https://stackoverflow.com/a/39180761
      contentRef.current.addEventListener('keydown', onKeyDown, true);
      // when removing event handler must have EXACT SAME ARGUMENTS, including `useContext`
      return () =>
        contentRef.current.removeEventListener('keydown', onKeyDown, true);
    }, [contentRef, activeAttributes, value, isActive]);
    // NOTE: Because `useAnchorRef` also called the `useMemo` hook, we need to call it here so that
    // adding a `Popover` doesn't change the hook order and trigger a React exception
    const anchorRef = useAnchorRef({ ref: contentRef, value, settings });
    return (
      <>
        <BlockControls>
          <ToolbarButton
            icon={symbolFilled}
            title={
              isActive
                ? __('Remove Data Element', Constants.TEXT_DOMAIN)
                : __('Insert Data Element', Constants.TEXT_DOMAIN)
            }
            isActive={isActive}
            onClick={() => {
              if (isActive) {
                tryRemoveFormat(onChange, value, Constants.FORMAT_DATA_ELEMENT);
                onFocus();
              } else {
                // `insert` source: https://github.com/WordPress/gutenberg/blob/trunk/packages/rich-text/src/insert.js
                // 1. For the second argument to `insert` can also pass in `create({ text: TRIGGER_PREFIX })`
                // `create` source: https://github.com/WordPress/gutenberg/blob/trunk/packages/rich-text/src/create.js
                // Instead of using `toggleFormat` (to insert format) or `insertObject` (to insert object),
                // we are merely inserting a string which will trigger the custom autocomplete.
                // 2. The autocomplete will insert a DataElementOption that matches the specifications
                // of this format and will be added as a format. Since the parameters of the DataElementOption
                // component match this format, then RichText will associate that component with this
                // custom component, setting the `isActive` and `activeAttributes` props appropriately
                onChange(insert(value, TRIGGER_PREFIX));
                onFocus();
              }
            }}
          />
        </BlockControls>
        {isActive && (
          <Popover
            anchorRef={anchorRef}
            focusOnMount={false}
            onClose={onFocus}
            className="data-element-option-popover"
          >
            <ButtonGroup className="data-element-option-popover__button-group">
              <Button
                className="data-element-option-popover__button"
                variant="link"
                onClick={() => {
                  // Replace entire badge with the trigger prefix to insert a new data-element
                  const { isFormatFound, startIndex, endIndex } =
                    getFormatBounds(value, Constants.FORMAT_DATA_ELEMENT);
                  if (isFormatFound) {
                    onChange(
                      insert(value, TRIGGER_PREFIX, startIndex, endIndex),
                    );
                    onFocus();
                  }
                }}
              >
                {__('Replace', Constants.TEXT_DOMAIN) +
                  ' "' +
                  trim(activeAttributes.originalLabel) +
                  '"'}
              </Button>
              <Button
                icon={close}
                label={
                  __('Remove', Constants.TEXT_DOMAIN) +
                  ' "' +
                  trim(activeAttributes.originalLabel) +
                  '"'
                }
                className="data-element-option-popover__button"
                variant="link"
                onClick={() => {
                  tryRemoveFormat(
                    onChange,
                    value,
                    Constants.FORMAT_DATA_ELEMENT,
                  );
                  onFocus();
                }}
              />
            </ButtonGroup>
          </Popover>
        )}
      </>
    );
  },
};

// see https://github.com/WordPress/gutenberg/tree/trunk/packages/rich-text#registerformattype
// see https://github.com/WordPress/gutenberg/blob/trunk/packages/rich-text/src/register-format-type.js
registerFormatType(Constants.FORMAT_DATA_ELEMENT, settings);
