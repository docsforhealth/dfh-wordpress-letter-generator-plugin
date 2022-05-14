import { useBlockProps } from '@wordpress/block-editor';
import { Fill } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Icon, image } from '@wordpress/icons';
import merge from 'lodash.merge';
import {
  ATTR_VISIBLE_CONTROLS,
  CONTEXT_VISIBLE_CONTROLS_KEY,
  Edit,
  Save,
  SHARED_CONFIG,
} from 'src/js/block/shared/data-element';
import DataElementImage from 'src/js/component/data-element-image';
import HelpLabel from 'src/js/component/help-label';
import * as Constants from 'src/js/constants';
import { tryRegisterBlockType } from 'src/js/utils/block';
import {
  reconcileVisibleAttrsAndContext,
  shouldShowControl,
} from 'src/js/utils/data-element';

export const INFO = {
  name: Constants.BLOCK_DATA_ELEMENT_IMAGE,
  icon: image,
  title: __('Image Element', Constants.TEXT_DOMAIN),
  description: __(
    'Allows uploading images and user drawings',
    Constants.TEXT_DOMAIN,
  ),
};

export const ATTR_UPLOAD_LABEL = 'uploadLabel';
export const ATTR_CAN_DRAW = 'canDraw';
export const ATTR_DRAW_LABEL = 'drawLabel';

tryRegisterBlockType(
  INFO.name,
  merge({}, SHARED_CONFIG, INFO, {
    apiVersion: 2,
    attributes: {
      [ATTR_UPLOAD_LABEL]: { type: 'string', default: '' },
      [ATTR_CAN_DRAW]: { type: 'boolean', default: false },
      [ATTR_DRAW_LABEL]: { type: 'string', default: '' },
    },
    edit({ clientId, context, attributes, setAttributes }) {
      const visibleControls = reconcileVisibleAttrsAndContext(
        attributes[ATTR_VISIBLE_CONTROLS],
        context[CONTEXT_VISIBLE_CONTROLS_KEY],
      );
      return (
        <Edit
          {...useBlockProps()}
          clientId={clientId}
          context={context}
          attributes={attributes}
          setAttributes={setAttributes}
        >
          {({ headerSlotName }) => (
            <>
              <Fill name={headerSlotName}>
                <HelpLabel
                  wrapperElementType="div"
                  wrapperProps={{ className: 'data-element__header__icon' }}
                  text={INFO.title}
                >
                  <Icon icon={INFO.icon} />
                </HelpLabel>
              </Fill>
              <DataElementImage
                uploadLabel={{
                  shouldShow: shouldShowControl(
                    visibleControls,
                    ATTR_UPLOAD_LABEL,
                  ),
                  value: attributes[ATTR_UPLOAD_LABEL],
                  onChange: (uploadLabel) =>
                    setAttributes({ [ATTR_UPLOAD_LABEL]: uploadLabel }),
                }}
                canDraw={{
                  shouldShow: shouldShowControl(visibleControls, ATTR_CAN_DRAW),
                  value: attributes[ATTR_CAN_DRAW],
                  onChange: (canDraw) =>
                    setAttributes({ [ATTR_CAN_DRAW]: canDraw }),
                }}
                drawLabel={{
                  shouldShow: shouldShowControl(
                    visibleControls,
                    ATTR_DRAW_LABEL,
                  ),
                  value: attributes[ATTR_DRAW_LABEL],
                  onChange: (drawLabel) =>
                    setAttributes({ [ATTR_DRAW_LABEL]: drawLabel }),
                }}
              />
            </>
          )}
        </Edit>
      );
    },
    save({ attributes }) {
      return <Save {...useBlockProps.save()} attributes={attributes} />;
    },
  }),
);
