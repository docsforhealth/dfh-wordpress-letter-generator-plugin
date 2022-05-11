import {
  PluginDocumentSettingPanel,
  PluginPostPublishPanel,
  PluginPrePublishPanel,
} from '@wordpress/edit-post';
import { __ } from '@wordpress/i18n';
import { registerPlugin } from '@wordpress/plugins';
import PropTypes from 'prop-types';
import { ATTR_ERROR_MESSAGES, TITLE } from 'src/js/block/letter-template';
import * as Constants from 'src/js/constants';
import CustomBlockStatusWatcher from 'src/js/setup/component/custom-block-status-watcher';
import { tryFindBlockInfoFromName } from 'src/js/utils/block';

// 1. Add a status badge to key editor interface elements for the letter template custom post type
// example: https://wordpress.stackexchange.com/questions/339138/add-pre-publish-conditions-to-the-block-editor
// 2. No Slotfill in the block editor header available to add content with extensive hacks
// see https://stackoverflow.com/a/63783598
// see https://github.com/WordPress/gutenberg/issues/16988

function LetterTemplateStatus({ wrapperType: StatusWrapper }) {
  const blockInfo = tryFindBlockInfoFromName(Constants.BLOCK_LETTER_TEMPLATE);
  return (
    !!blockInfo && (
      <StatusWrapper title={TITLE} initialOpen>
        <CustomBlockStatusWatcher
          clientId={blockInfo.clientId}
          validMessage={__(
            'This letter template is all set!',
            Constants.TEXT_DOMAIN,
          )}
          errorsAttrName={ATTR_ERROR_MESSAGES}
          lockSavingIfInvalid
        />
      </StatusWrapper>
    )
  );
}
LetterTemplateStatus.propTypes = {
  wrapperType: PropTypes.elementType.isRequired,
};

// see https://github.com/WordPress/gutenberg/tree/trunk/packages/edit-post#plugindocumentsettingpanel
registerPlugin(`${Constants.NAMESPACE}-letter-template-document-settings`, {
  render() {
    return <LetterTemplateStatus wrapperType={PluginDocumentSettingPanel} />;
  },
});

// see https://github.com/WordPress/gutenberg/tree/trunk/packages/edit-post#pluginprepublishpanel
registerPlugin(`${Constants.NAMESPACE}-letter-template-pre-publish`, {
  render() {
    return <LetterTemplateStatus wrapperType={PluginPrePublishPanel} />;
  },
});

// see https://github.com/WordPress/gutenberg/tree/trunk/packages/edit-post#pluginpostpublishpanel
registerPlugin(`${Constants.NAMESPACE}-letter-template-post-publish`, {
  render() {
    return <LetterTemplateStatus wrapperType={PluginPostPublishPanel} />;
  },
});
