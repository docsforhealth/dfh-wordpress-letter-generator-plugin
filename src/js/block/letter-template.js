import { InnerBlocks, useBlockProps } from '@wordpress/block-editor';
import { Slot, TabPanel } from '@wordpress/components';
import { createContext, useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Icon } from '@wordpress/icons';
import { isEqual, noop } from 'lodash';
import * as Constants from 'src/js/constants';
import {
  LETTER_CONTENT_INFO,
  LETTER_DATA_ELEMENTS_INFO,
  LETTER_DATA_LAYOUT_INFO,
} from 'src/js/constants/data-element';
import { markAttrHiddenInApi } from 'src/js/utils/api';
import { slotName, tryRegisterBlockType } from 'src/js/utils/block';

export const TITLE = __('Letter Template', Constants.TEXT_DOMAIN);
export const ATTR_ERROR_MESSAGES = markAttrHiddenInApi('errorMessages');

export const LetterTemplateContext = createContext({
  templateClientId: null,
  numLocalDataElements: 0,
  updateNumLocalDataElements: noop,
  numLayoutPreviews: 0,
  updateNumLayoutPreviews: noop,
});
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
      [comboKeyToOption, updateComboKeyToOption] = useState(null),
      [numLocalDataElements, updateNumLocalDataElements] = useState(0),
      [numLayoutPreviews, updateNumLayoutPreviews] = useState(0);
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
      <LetterTemplateContext.Provider
        value={{
          templateClientId: clientId,
          numLocalDataElements,
          updateNumLocalDataElements,
          numLayoutPreviews,
          updateNumLayoutPreviews,
        }}
      >
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
              <TabPanel
                className="letter-template"
                activeClass="letter-template__tab--active"
                tabs={[
                  {
                    ...LETTER_DATA_ELEMENTS_INFO,
                    title: (
                      <span className="letter-template__tab__title">
                        <Icon
                          className="letter-template__tab__title__icon"
                          icon={LETTER_DATA_ELEMENTS_INFO.icon}
                        />
                        <span className="letter-template__tab__title__label">
                          {LETTER_DATA_ELEMENTS_INFO.title}
                        </span>
                        <span className="letter-template__tab__title__number">
                          {numLocalDataElements}
                        </span>
                      </span>
                    ),
                    className:
                      'letter-template__tab letter-template__tab--secondary',
                  },
                  {
                    ...LETTER_CONTENT_INFO,
                    className: 'letter-template__tab',
                  },
                  {
                    ...LETTER_DATA_LAYOUT_INFO,
                    title: (
                      <span className="letter-template__tab__title">
                        <Icon
                          className="letter-template__tab__title__icon"
                          icon={LETTER_DATA_LAYOUT_INFO.icon}
                        />
                        <span className="letter-template__tab__title__label">
                          {LETTER_DATA_LAYOUT_INFO.title}
                        </span>
                        <span className="letter-template__tab__title__number">
                          {numLayoutPreviews}
                        </span>
                      </span>
                    ),
                    className:
                      'letter-template__tab letter-template__tab--secondary',
                  },
                ]}
                initialTabName={LETTER_CONTENT_INFO.name}
              >
                {(tab) => (
                  <Slot
                    name={slotName(tab.name, clientId)}
                    // TIP: need `bubblesVirtually` on the Slot in order for InnerBlocks to work propertly
                    bubblesVirtually
                  />
                )}
              </TabPanel>
            </div>
          </LetterContentContext.Provider>
        </DataOptionsContext.Provider>
      </LetterTemplateContext.Provider>
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
