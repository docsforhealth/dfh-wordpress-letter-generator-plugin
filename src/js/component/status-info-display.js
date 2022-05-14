import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';
import * as Constants from 'src/js/constants';

export default function StatusInfoDisplay({ className, validMessage, errors }) {
  if (errors?.length) {
    return (
      <div
        className={`status-info-display status-info-display--invalid ${
          className ?? ''
        }`}
      >
        <h3 className="status-info-display__title">
          {__('Errors', Constants.TEXT_DOMAIN)}
        </h3>
        {errors.length > 1 ? (
          // Only show list if multiple errors
          <ol>
            {errors.map((errorMessage, index) => (
              <li key={index}>{errorMessage}</li>
            ))}
          </ol>
        ) : (
          <div className="status-info-display__message">{errors[0]}</div>
        )}
      </div>
    );
  } else if (validMessage) {
    return (
      <div className={`status-info-display ${className ?? ''}`}>
        {validMessage}
      </div>
    );
  } else {
    return null;
  }
}
StatusInfoDisplay.propTypes = {
  className: PropTypes.string,
  validMessage: PropTypes.string,
  errors: PropTypes.arrayOf(PropTypes.string),
};
