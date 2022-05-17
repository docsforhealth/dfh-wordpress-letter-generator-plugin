import { useBlockProps } from '@wordpress/block-editor';
import merge from 'lodash.merge';
import {
  CONTEXT_VISIBLE_CONTROLS_KEY,
  Edit,
  Save,
  SHARED_CONFIG,
} from 'src/js/block/shared/data-element';
import DataElementImage from 'src/js/component/data-element-image';
import {
  ATTR_VISIBLE_CONTROLS,
  IMAGE_INFO,
} from 'src/js/constants/data-element';
import { tryRegisterBlockType } from 'src/js/utils/block';
import {
  reconcileVisibleAttrsAndContext,
  shouldShowControl,
} from 'src/js/utils/data-element';

const ATTR_UPLOAD_LABEL = 'uploadLabel';
const ATTR_CAN_DRAW = 'canDraw';
const ATTR_DRAW_LABEL = 'drawLabel';

tryRegisterBlockType(
  IMAGE_INFO.name,
  merge({}, SHARED_CONFIG, IMAGE_INFO, {
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
          <DataElementImage
            uploadLabel={{
              shouldShow: shouldShowControl(visibleControls, ATTR_UPLOAD_LABEL),
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
              shouldShow: shouldShowControl(visibleControls, ATTR_DRAW_LABEL),
              value: attributes[ATTR_DRAW_LABEL],
              onChange: (drawLabel) =>
                setAttributes({ [ATTR_DRAW_LABEL]: drawLabel }),
            }}
          />
        </Edit>
      );
    },
    save({ attributes }) {
      return <Save {...useBlockProps.save()} attributes={attributes} />;
    },
  }),
);
