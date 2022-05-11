import { RichText } from '@wordpress/block-editor';
import {
  Button,
  Fill,
  Slot,
  ToggleControl,
  __experimentalUseSlot as useSlot,
} from '@wordpress/components';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { some } from 'lodash';
import PropTypes from 'prop-types';
import {
  SLOT_CONTROLS_SECONDARY,
  SLOT_CONTROLS_TOGGLES,
  SLOT_HELP_OVERLAY,
  SLOT_OVERLAY,
} from 'src/js/component/data-element/contents';
import Overlay from 'src/js/component/data-element/overlay';
import EditorLabelWrapper, {
  STYLE_FORM_LABEL,
} from 'src/js/component/editor-label-wrapper';
import HelpIcon from 'src/js/component/help-icon';
import * as Constants from 'src/js/constants';
import { buildAttrPropType, slotName } from 'src/js/utils/data-element';

export default function Controls({
  clientId,
  forceHide,
  required,
  saveable,
  helpText,
}) {
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);
  const toggles = useSlot(SLOT_CONTROLS_TOGGLES),
    secondaryControls = useSlot(SLOT_CONTROLS_SECONDARY);
  const hasContent = some([
    required.shouldShow,
    saveable.shouldShow,
    helpText.shouldShow,
    toggles?.fills?.length,
    secondaryControls?.fills?.length,
  ]);
  // Hide the contents via CSS instead of removing from DOM to avoid infinite render loops:
  // 1. When the help overlay is inserted
  // 2. If any of the slots within this component are used to render an overlay
  return (
    hasContent && (
      <div
        className={`data-element__controls ${
          forceHide ? 'data-element__controls--hidden' : ''
        }`}
      >
        <div className="data-element__controls__toggles">
          {required.shouldShow && (
            <ToggleControl
              label={__('Required', Constants.TEXT_DOMAIN)}
              checked={required.value}
              onChange={required.onChange}
            />
          )}
          {saveable.shouldShow && (
            <>
              <ToggleControl
                label={__('Save locally', Constants.TEXT_DOMAIN)}
                checked={saveable.value}
                onChange={saveable.onChange}
              />
              <HelpIcon
                text={__(
                  "Saving locally to the user's device is NOT secure. Make sure that this field will not have protected health information.",
                  Constants.TEXT_DOMAIN,
                )}
              />
            </>
          )}
          <Slot
            name={slotName(SLOT_CONTROLS_TOGGLES, clientId)}
            className="data-element__controls__toggles__more"
            bubblesVirtually
          />
        </div>
        <div className="data-element__controls__secondary">
          <Slot
            name={slotName(SLOT_CONTROLS_SECONDARY, clientId)}
            className="data-element__controls__secondary__more"
            bubblesVirtually
          />
          {helpText.shouldShow && (
            <>
              <Button
                className="data-element__button"
                onClick={() => setIsOverlayOpen(true)}
              >
                {helpText.value
                  ? __('Edit help', Constants.TEXT_DOMAIN)
                  : __('Add help', Constants.TEXT_DOMAIN)}
              </Button>
              {isOverlayOpen && (
                <Fill name={slotName(SLOT_OVERLAY, clientId)}>
                  <Overlay
                    title={__('Editing help', Constants.TEXT_DOMAIN)}
                    onClose={() => setIsOverlayOpen(false)}
                    contentClassName="help-text-overlay"
                  >
                    <EditorLabelWrapper
                      label={__('Help text', Constants.TEXT_DOMAIN)}
                      style={STYLE_FORM_LABEL}
                    >
                      {(id) => (
                        <RichText
                          id={id}
                          placeholder={__(
                            'Provide tips for filling out this field',
                            Constants.TEXT_DOMAIN,
                          )}
                          value={helpText.value}
                          onChange={helpText.onChange}
                          preserveWhiteSpace
                        />
                      )}
                    </EditorLabelWrapper>
                    <Slot
                      name={slotName(SLOT_HELP_OVERLAY, clientId)}
                      bubblesVirtually
                    />
                  </Overlay>
                </Fill>
              )}
            </>
          )}
        </div>
      </div>
    )
  );
}
Controls.propTypes = {
  clientId: PropTypes.string.isRequired,
  forceHide: PropTypes.bool,
  required: buildAttrPropType(PropTypes.bool, true),
  saveable: buildAttrPropType(PropTypes.bool, true),
  helpText: buildAttrPropType(PropTypes.string, true),
};

Controls.Content = function ({ helpText }) {
  return <RichText.Content value={helpText} />;
};
Controls.Content.propTypes = {
  helpText: PropTypes.string,
};
