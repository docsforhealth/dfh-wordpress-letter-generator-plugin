import { InnerBlocks, useBlockProps } from '@wordpress/block-editor';
import { createContext, useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { isEqual, noop } from 'lodash';
import * as Constants from 'src/js/constants';
import { markAttrHiddenInApi } from 'src/js/utils/api';
import { tryRegisterBlockType } from 'src/js/utils/block';

// TODO handle initial case where no data elements are specified

export const TITLE = __('Letter Template', Constants.TEXT_DOMAIN);
export const ATTR_ERROR_MESSAGES = markAttrHiddenInApi('errorMessages');

export const DataOptionsContext = createContext({
  comboKeyToOption: Object.create(null),
  updateComboKeyToOption: noop,
});
export const LetterContentContext = createContext({
  badges: [],
  updateBadges: noop,
});

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
    const [badges, updateBadges] = useState(null),
      [comboKeyToOption, updateComboKeyToOption] = useState(null);
    // Validation for this content type
    useEffect(() => {
      const newErrors = [];
      // if `badges` is null, that means we haven't initialized yet so don't push error
      if (badges?.length === 0) {
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
    }, [badges?.length]);
    return (
      <DataOptionsContext.Provider
        value={{ comboKeyToOption, updateComboKeyToOption }}
      >
        <LetterContentContext.Provider value={{ badges, updateBadges }}>
          <div {...useBlockProps()}>
            <InnerBlocks
              templateLock={Constants.INNER_BLOCKS_LOCKED}
              template={[
                [Constants.BLOCK_LETTER_DATA_ELEMENTS],
                [Constants.BLOCK_LETTER_CONTENT],
                [Constants.BLOCK_LETTER_DATA_LAYOUT],
              ]}
            />
          </div>
        </LetterContentContext.Provider>
      </DataOptionsContext.Provider>
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
