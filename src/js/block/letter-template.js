import { InnerBlocks, useBlockProps } from '@wordpress/block-editor';
import { useSelect } from '@wordpress/data';
import { useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { find, isEqual } from 'lodash';
import { ATTR_NUM_BADGES } from 'src/js/block/helper/letter-content';
import * as Constants from 'src/js/constants';
import { markAttrHiddenInApi } from 'src/js/utils/api';
import { tryRegisterBlockType } from 'src/js/utils/block';

// TODO handle initial case where no data elements are specified
// TODO options for where to display used global data elements??

export const TITLE = __('Letter Template', Constants.TEXT_DOMAIN);
export const ATTR_ERROR_MESSAGES = markAttrHiddenInApi('errorMessages');

tryRegisterBlockType(Constants.BLOCK_LETTER_TEMPLATE, {
  apiVersion: 2,
  title: TITLE,
  category: Constants.CATEGORY_LETTER_TEMPLATE,
  icon: 'welcome-write-blog',
  description: __(
    'Specify data elements and letter content for a letter template',
    Constants.TEXT_DOMAIN,
  ),
  attributes: {
    [ATTR_ERROR_MESSAGES]: { type: 'array', default: [] },
  },
  edit({ attributes, setAttributes, clientId }) {
    // will fire on every render because no clear dependency
    const numDataElementsUsed = useSelect(
      (select) =>
        find(
          select(Constants.STORE_BLOCK_EDITOR).getBlock(clientId)?.innerBlocks,
          ['name', Constants.BLOCK_LETTER_CONTENT],
        )?.attributes?.[ATTR_NUM_BADGES] ?? 0,
    );
    useEffect(() => {
      const newErrors = [];
      if (!numDataElementsUsed) {
        newErrors.push(
          __(
            "Please insert at least one data element, whether shared or local, into this letter template's content",
            Constants.TEXT_DOMAIN,
          ),
        );
      }
      if (!isEqual(attributes[ATTR_ERROR_MESSAGES], newErrors)) {
        setAttributes({ [ATTR_ERROR_MESSAGES]: newErrors });
      }
    }, [numDataElementsUsed]);
    return (
      <div {...useBlockProps()}>
        <InnerBlocks
          templateLock={Constants.INNER_BLOCKS_LOCKED}
          template={[
            [Constants.BLOCK_DATA_ELEMENTS],
            [Constants.BLOCK_LETTER_CONTENT],
          ]}
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
});
