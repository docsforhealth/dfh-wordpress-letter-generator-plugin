import { Icon, info } from '@wordpress/icons';
import PropTypes from 'prop-types';

export default function MessageDisplay({ title, icon = info, children }) {
  return (
    <div className="message-display">
      <div className="message-display__title">
        {icon && (
          <div className="message-display__title__icon">
            <Icon icon={icon} />
          </div>
        )}
        {title}
      </div>
      <div className="message-display__contents">{children}</div>
    </div>
  );
}
MessageDisplay.propTypes = {
  title: PropTypes.node.isRequired,
  icon: PropTypes.element,
};
