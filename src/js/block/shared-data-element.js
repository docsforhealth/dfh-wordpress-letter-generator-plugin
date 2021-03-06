import {
  BlockControls,
  InnerBlocks,
  useBlockProps,
} from '@wordpress/block-editor';
import { createBlock } from '@wordpress/blocks';
import { ToolbarButton } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { undo } from '@wordpress/icons';
import { isEqual, throttle } from 'lodash';
import withApiData, {
  KEY_CUSTOMIZE_API_DATA,
} from 'src/js/block/shared/with-api-data';
import PlaceholderWithOptions from 'src/js/component/placeholder-with-options';
import * as Constants from 'src/js/constants';
import {
  ATTR_LABEL,
  IMAGE_INFO,
  LETTER_DATA_ELEMENTS_INFO,
  OPTIONS_INFO,
  TEXT_INFO,
} from 'src/js/constants/data-element';
import useSyncTwoValues from 'src/js/hook/use-sync-two-values';
import {
  API_CONFIG_INNER_BLOCKS_NESTED_HAS_MANY,
  markAttrHiddenInApi,
  useAllChildData,
} from 'src/js/utils/api';
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

tryRegisterBlockType(
  Constants.BLOCK_SHARED_DATA_ELEMENT,
  withApiData({
    apiVersion: 2,
    title: TITLE,
    category: Constants.CATEGORY_LETTER_TEMPLATE,
    icon: LETTER_DATA_ELEMENTS_INFO.icon,
    description,
    attributes: {
      // `InnerBlocks` here only takes ONE child block so we will use `API_CONFIG_INNER_BLOCKS_NESTED_HAS_MANY`
      // to avoid an unnecesary array in the API representation of this block
      [API_CONFIG_INNER_BLOCKS_NESTED_HAS_MANY]: {
        type: 'object',
        default: {
          [IMAGE_INFO.name]: useAllChildData('dataElement'),
          [OPTIONS_INFO.name]: useAllChildData('dataElement'),
          [TEXT_INFO.name]: useAllChildData('dataElement'),
        },
      },
      [ATTR_ERROR_MESSAGES]: { type: 'array', default: [] },
    },
    [KEY_CUSTOMIZE_API_DATA](apiData) {
      return apiData.dataElement ?? apiData;
    },
    edit({ attributes, setAttributes, clientId }) {
      // will fire on every render because no clear dependency
      const innerBlocks = useSelect((select) =>
        getInnerBlocks(clientId, select),
      );
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
      // NOTE: because we have an `insert` template lock when specifying this custom content type, we
      // can't use `insertBlock` and need to use `replaceInnerBlocks` instead
      const { replaceInnerBlocks } = useDispatch(Constants.STORE_BLOCK_EDITOR),
        clearDataElement = () => replaceInnerBlocks(clientId, []),
        onSelect = ({ name }) =>
          replaceInnerBlocks(clientId, [
            createBlock(name, { [ATTR_LABEL]: postTitle }),
          ]);
      return (
        <div
          {...useBlockProps({ className: 'data-elements-counter-container' })}
        >
          {innerBlocks.length ? (
            <BlockControls>
              <ToolbarButton
                icon={undo}
                title={__('Reselect data element type', Constants.TEXT_DOMAIN)}
                onClick={clearDataElement}
              />
            </BlockControls>
          ) : (
            <PlaceholderWithOptions
              icon={LETTER_DATA_ELEMENTS_INFO.icon}
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
          <InnerBlocks
            allowedBlocks={[IMAGE_INFO.name, OPTIONS_INFO.name, TEXT_INFO.name]}
            renderAppender={false}
          />
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
