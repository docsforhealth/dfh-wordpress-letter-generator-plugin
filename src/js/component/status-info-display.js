import { __ } from '@wordpress/i18n';
import PropTypes from 'prop-types';
import * as Constants from 'src/js/constants';

export default function CustomBlockStatusInfo({ validMessage, errors }) {
  return errors?.length ? (
    <div className="status-info-display status-info-display--invalid">
      <h3 className="status-info-display__title">
        {__('Errors', Constants.TEXT_DOMAIN)}
      </h3>
      {errors.length ? (
        // Only show list if multiple errors
        <ol>
          {errors.map((errorMessage, index) => (
            <li key={index}>{errorMessage}</li>
          ))}
        </ol>
      ) : (
        errorMessage
      )}
    </div>
  ) : (
    <div className="status-info-display">{validMessage}</div>
  );
}
CustomBlockStatusInfo.propTypes = {
  validMessage: PropTypes.string,
  errors: PropTypes.arrayOf(PropTypes.string),
};
