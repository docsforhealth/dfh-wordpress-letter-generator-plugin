import { InnerBlocks, useBlockProps } from '@wordpress/block-editor';
import { createBlock } from '@wordpress/blocks';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { isEqual, throttle } from 'lodash';
import PlaceholderWithOptions from 'src/js/component/placeholder-with-options';
import * as Constants from 'src/js/constants';
import {
  ATTR_LABEL,
  IMAGE_INFO,
  LETTER_DATA_ELEMENTS_ICON,
  OPTIONS_INFO,
  TEXT_INFO,
} from 'src/js/constants/data-element';
import useInsertBlock from 'src/js/hook/use-insert-block';
import useSyncTwoValues from 'src/js/hook/use-sync-two-values';
import { markAttrHiddenInApi } from 'src/js/utils/api';
import { getInnerBlocks, tryRegisterBlockType } from 'src/js/utils/block';
import { validateDataElement } from 'src/js/utils/validation';

export const TITLE = __('Shared Data Element', Constants.TEXT_DOMAIN);
export const ATTR_ERROR_MESSAGES = markAttrHiddenInApi('errorMessages');

const description = __(
  'Shared data elements can be used across multiple letter templates',
  Constants.TEXT_DOMAIN,
);
const tryValidate = throttle((innerBlocks, oldErrors, updateErrors) => {
  const newErrors = []; // No errors implicitly means is valid
  if (innerBlocks?.length) {
    newErrors.push(...validateDataElement(innerBlocks[0]));
  } else {
    newErrors.push(
      __(
        'Please specify a data type for this shared data element',
        Constants.TEXT_DOMAIN,
      ),
    );
  }
  if (!isEqual(oldErrors, newErrors)) {
    updateErrors(newErrors);
  }
}, 200);

tryRegisterBlockType(Constants.BLOCK_SHARED_DATA_ELEMENT, {
  apiVersion: 2,
  title: TITLE,
  category: Constants.CATEGORY_LETTER_TEMPLATE,
  icon: LETTER_DATA_ELEMENTS_ICON,
  description,
  attributes: {
    [ATTR_ERROR_MESSAGES]: { type: 'array', default: [] },
  },
  edit({ attributes, setAttributes, clientId }) {
    // will fire on every render because no clear dependency
    const innerBlocks = useSelect((select) => getInnerBlocks(clientId, select));
    // This effect hook will run every time since dependencies are not provided but
    // is rate limited  for better performance
    useEffect(() => {
      // this throttled function will be called with the MOST RECENT set of arguments
      tryValidate(innerBlocks, attributes[ATTR_ERROR_MESSAGES], (newErrors) =>
        setAttributes({ [ATTR_ERROR_MESSAGES]: newErrors }),
      );
      return tryValidate.cancel;
    });
    // keep the post title and data element label in sync
    const label = innerBlocks[0]?.attributes?.[ATTR_LABEL],
      // will fire on every render because no clear dependency
      postTitle = useSelect((select) =>
        select(Constants.STORE_POST_EDITOR).getEditedPostAttribute('title'),
      );
    const { editPost } = useDispatch(Constants.STORE_POST_EDITOR),
      { updateBlock } = useDispatch(Constants.STORE_BLOCK_EDITOR);
    useSyncTwoValues(
      label,
      postTitle,
      (label) =>
        updateBlock(innerBlocks[0]?.clientId, {
          attributes: { [ATTR_LABEL]: label },
        }),
      (title) => editPost({ title }),
    );
    // function to insert data element block, which will have label set to be the current post title
    const insertBlock = useInsertBlock(clientId),
      onSelect = ({ type }) =>
        insertBlock(createBlock(type, { [ATTR_LABEL]: postTitle }));
    return (
      <div {...useBlockProps()}>
        {!innerBlocks.length && (
          <PlaceholderWithOptions
            icon={LETTER_DATA_ELEMENTS_ICON}
            label={__(
              'Create a new shared data element',
              Constants.TEXT_DOMAIN,
            )}
            instructions={description}
            options={[
              {
                ...IMAGE_INFO,
                label: IMAGE_INFO.title,
                onSelect,
              },
              {
                ...OPTIONS_INFO,
                label: OPTIONS_INFO.title,
                onSelect,
              },
              {
                ...TEXT_INFO,
                label: TEXT_INFO.title,
                onSelect,
              },
            ]}
          />
        )}
        <InnerBlocks renderAppender={false} />
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
});
