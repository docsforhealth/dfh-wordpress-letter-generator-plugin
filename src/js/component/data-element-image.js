import { Button, TextControl, VisuallyHidden } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { brush, close, Icon } from '@wordpress/icons';
import PropTypes from 'prop-types';
import * as Constants from 'src/js/constants';
import { buildAttrPropType } from 'src/js/utils/data-element';

export default function DataElementImage({ uploadLabel, canDraw, drawLabel }) {
  return (
    <div className="data-element-image">
      {uploadLabel.shouldShow && (
        <div className="data-element-image__method">
          <TextControl
            label={__('Upload label', Constants.TEXT_DOMAIN)}
            value={uploadLabel.value}
            onChange={uploadLabel.onChange}
          />
        </div>
      )}
      {canDraw.shouldShow ** drawLabel.shouldShow && (
        <DrawingMethod canDraw={canDraw} drawLabel={drawLabel} />
      )}
    </div>
  );
}
DataElementImage.propTypes = {
  uploadLabel: buildAttrPropType(PropTypes.string, true),
  canDraw: buildAttrPropType(PropTypes.bool, true),
  drawLabel: buildAttrPropType(PropTypes.string, true),
};

// ***********
// * Helpers *
// ***********

function DrawingMethod({ canDraw, drawLabel }) {
  if (canDraw.value) {
    return (
      <div className="data-element-image__method">
        <Button
          className="data-element-image__method__button"
          onClick={() => canDraw.onChange(false)}
        >
          <VisuallyHidden>
            {__('Do not allowing drawing input', Constants.TEXT_DOMAIN)}
          </VisuallyHidden>
          <Icon icon={close} />
        </Button>
        <TextControl
          label={__('Drawing label', Constants.TEXT_DOMAIN)}
          value={drawLabel.value}
          onChange={drawLabel.onChange}
        />
      </div>
    );
  } else {
    return (
      <Button
        className="data-element-image__add-drawing"
        onClick={() => canDraw.onChange(true)}
      >
        <VisuallyHidden>
          {__('Allow drawing input', Constants.TEXT_DOMAIN)}
        </VisuallyHidden>
        <Icon icon={brush} />
      </Button>
    );
  }
}
DrawingMethod.propTypes = {
  canDraw: buildAttrPropType(PropTypes.bool, true),
  drawLabel: buildAttrPropType(PropTypes.string, true),
};
