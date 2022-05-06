import { useBlockProps } from '@wordpress/block-editor';
import { TextControl, ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { image } from '@wordpress/icons';
import merge from 'lodash.merge';
import * as DataElement from 'src/js/block/shared/data-element';
import * as Constants from 'src/js/constants';
import { tryRegisterBlockType } from 'src/js/utils/block';

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

// re-export default `validateBlockInfo` implementation
export { validateBlockInfo } from 'src/js/block/shared/data-element';

tryRegisterBlockType(
  INFO.name,
  merge({}, DataElement.SHARED_CONFIG, INFO, {
    apiVersion: 2,
    attributes: {
      [ATTR_UPLOAD_LABEL]: { type: 'string', default: '' },
      [ATTR_CAN_DRAW]: { type: 'boolean', default: false },
      [ATTR_DRAW_LABEL]: { type: 'string', default: '' },
    },
    edit({ clientId, context, attributes, setAttributes }) {
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
              ATTR_UPLOAD_LABEL,
            ) && (
              <TextControl
                label={__('Upload image label', Constants.TEXT_DOMAIN)}
                value={attributes[ATTR_UPLOAD_LABEL]}
                onChange={(uploadLabel) =>
                  setAttributes({ [ATTR_UPLOAD_LABEL]: uploadLabel })
                }
              />
            )}
            {DataElement.shouldShowControl(
              { context, attributes },
              ATTR_CAN_DRAW,
              ATTR_DRAW_LABEL,
            ) && (
              <>
                <ToggleControl
                  label={__('Allow drawing input?', Constants.TEXT_DOMAIN)}
                  checked={attributes[ATTR_CAN_DRAW]}
                  onChange={(canDraw) =>
                    setAttributes({ [ATTR_CAN_DRAW]: canDraw })
                  }
                />
                {attributes.canDraw && (
                  <TextControl
                    label={__('Draw option label', Constants.TEXT_DOMAIN)}
                    value={attributes[ATTR_DRAW_LABEL]}
                    onChange={(drawLabel) =>
                      setAttributes({ [ATTR_DRAW_LABEL]: drawLabel })
                    }
                  />
                )}
              </>
            )}
          </DataElement.Edit>
        </div>
      );
    },
  }),
);
