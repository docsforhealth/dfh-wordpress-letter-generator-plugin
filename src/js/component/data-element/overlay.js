import { Button, VisuallyHidden } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { close, Icon } from '@wordpress/icons';
import PropTypes from 'prop-types';
import * as Constants from 'src/js/constants';

export default function Overlay({
  title,
  onClose,
  showClose = true,
  contentClassName,
  children,
}) {
  return (
    <div className="data-element-overlay">
      <div className="data-element-overlay__header">
        <span className="data-element-overlay__header__title">{title}</span>
        {showClose && (
          <Button
            className="data-element-overlay__header__close"
            onClick={onClose}
          >
            <VisuallyHidden>
              {__('Close overlay', Constants.TEXT_DOMAIN)}
            </VisuallyHidden>
            <Icon icon={close} />
          </Button>
        )}
      </div>
      <div
        className={`data-element-overlay__contents ${contentClassName ?? ''}`}
      >
        {children}
      </div>
    </div>
  );
}
Overlay.propTypes = {
  title: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  showClose: PropTypes.bool,
  contentClassName: PropTypes.string,
};
